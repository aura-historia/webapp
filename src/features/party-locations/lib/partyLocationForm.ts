import { z } from "zod";
import {
    isBoundedSingleLine,
    isBoundedText,
    MAX_ADDRESS_TEXT_BYTES,
    MAX_POSTAL_CODE_BYTES,
    type GeographicAssertionsInput,
} from "@/data/internal/geography/GeographicAssertions.ts";
import {
    getSubdivisionCountry,
    parseCountryCode,
    parseSubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    GEOGRAPHIC_PRECISIONS,
    parseGeographicPoint,
    type GeographicPosition,
} from "@/data/internal/geography/GeographicPosition.ts";
import {
    type CorrectPartyLocationInput,
    type CreatePartyLocationInput,
    MAX_EVIDENCE_REFERENCE_BYTES,
    MAX_PARTY_LOCATION_LABEL_BYTES,
    PARTY_LOCATION_EVIDENCE_SCOPES,
    PARTY_LOCATION_ROLES,
    type PartyLocation,
    type PartyLocationEvidenceInput,
} from "@/data/internal/geography/PartyLocation.ts";

/** Text fields hold the input verbatim; blank optional fields mean "not asserted". */
export const partyLocationFormSchema = z
    .object({
        label: z.string(),
        roles: z.array(z.enum(PARTY_LOCATION_ROLES)),
        addressText: z.string(),
        country: z.string(),
        subdivision: z.string(),
        postalCode: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        precision: z.union([z.literal(""), z.enum(GEOGRAPHIC_PRECISIONS)]),
        accuracyMetres: z.string(),
        evidenceReference: z.string(),
        evidenceScope: z.enum(PARTY_LOCATION_EVIDENCE_SCOPES),
        /** `YYYY-MM-DD`, interpreted as a UTC calendar day. */
        evidenceObservedOn: z.string(),
    })
    .superRefine((values, context) => {
        const issue = (path: keyof typeof values, message: string) =>
            context.addIssue({ code: "custom", path: [path], message });

        const label = values.label.trim();
        if (!label) issue("label", "partyLocations.validation.labelRequired");
        else if (!isBoundedSingleLine(label, MAX_PARTY_LOCATION_LABEL_BYTES)) {
            issue("label", "partyLocations.validation.labelInvalid");
        }

        if (
            !isBlank(values.addressText) &&
            !isBoundedText(values.addressText, MAX_ADDRESS_TEXT_BYTES)
        ) {
            issue("addressText", "partyLocations.validation.addressTextTooLong");
        }
        if (
            !isBlank(values.postalCode) &&
            !isBoundedSingleLine(values.postalCode, MAX_POSTAL_CODE_BYTES)
        ) {
            issue("postalCode", "partyLocations.validation.postalCodeInvalid");
        }
        const country = values.country ? parseCountryCode(values.country) : undefined;
        if (values.country && !country) {
            issue("country", "partyLocations.validation.countryInvalid");
        }
        if (values.subdivision) {
            const subdivision = parseSubdivisionCode(values.subdivision);
            if (!subdivision) issue("subdivision", "partyLocations.validation.subdivisionInvalid");
            else if (country && getSubdivisionCountry(subdivision) !== country) {
                issue("subdivision", "partyLocations.validation.subdivisionMismatch");
            }
        }

        if (hasPositionInput(values)) {
            const latitude = parseDecimal(values.latitude);
            const longitude = parseDecimal(values.longitude);
            if (latitude === undefined || Math.abs(latitude) > 90) {
                issue("latitude", "partyLocations.validation.latitudeInvalid");
            }
            if (longitude === undefined || Math.abs(longitude) > 180) {
                issue("longitude", "partyLocations.validation.longitudeInvalid");
            }
            if (!values.precision)
                issue("precision", "partyLocations.validation.precisionRequired");
            if (!isBlank(values.accuracyMetres)) {
                const accuracy = parseDecimal(values.accuracyMetres);
                if (accuracy === undefined || accuracy < 0) {
                    issue("accuracyMetres", "partyLocations.validation.accuracyInvalid");
                }
            }
        }

        if (isBlank(values.evidenceReference)) {
            if (values.evidenceObservedOn) {
                issue("evidenceReference", "partyLocations.validation.evidenceReferenceRequired");
            }
        } else if (!isBoundedSingleLine(values.evidenceReference, MAX_EVIDENCE_REFERENCE_BYTES)) {
            issue("evidenceReference", "partyLocations.validation.evidenceReferenceInvalid");
        }
        if (values.evidenceObservedOn && !parseUtcDay(values.evidenceObservedOn)) {
            issue("evidenceObservedOn", "partyLocations.validation.observedOnInvalid");
        }
    });

export type PartyLocationFormValues = z.infer<typeof partyLocationFormSchema>;

function isBlank(value: string) {
    return value.trim().length === 0;
}

function hasPositionInput(values: PartyLocationFormValues) {
    return (
        !isBlank(values.latitude) ||
        !isBlank(values.longitude) ||
        values.precision !== "" ||
        !isBlank(values.accuracyMetres)
    );
}

/** Plain decimal degrees or metres; a single comma is accepted as the decimal separator. */
export function parseDecimal(value: string): number | undefined {
    const normalized = value.trim().replace(/^([+-]?\d+),(\d+)$/, "$1.$2");
    if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function parseUtcDay(value: string): Date | undefined {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
        ? undefined
        : date;
}

export function toPartyLocationFormValues(location?: PartyLocation): PartyLocationFormValues {
    const geography = location?.geography;
    const position = location?.position;
    const evidence = location?.evidence;
    return {
        label: location?.label ?? "",
        roles: [...(location?.roles ?? [])],
        addressText: geography?.addressText ?? "",
        country: geography?.country ?? "",
        subdivision: geography?.subdivision ?? "",
        postalCode: geography?.postalCode ?? "",
        latitude: position ? String(position.point.latitude) : "",
        longitude: position ? String(position.point.longitude) : "",
        precision: position?.precision ?? "",
        accuracyMetres:
            position?.accuracyMetres === undefined ? "" : String(position.accuracyMetres),
        evidenceReference: evidence?.reference ?? "",
        evidenceScope: evidence?.scope ?? "SITE_DESCRIPTION",
        evidenceObservedOn: evidence?.observedAt?.toISOString().slice(0, 10) ?? "",
    };
}

/** Relocation starts a new location: only the label and business roles carry over. */
export function toRelocationFormValues(location: PartyLocation): PartyLocationFormValues {
    return { ...toPartyLocationFormValues(), label: location.label, roles: [...location.roles] };
}

function toGeography(values: PartyLocationFormValues): GeographicAssertionsInput | undefined {
    const country = parseCountryCode(values.country);
    const subdivision = parseSubdivisionCode(values.subdivision);
    const geography: GeographicAssertionsInput = {
        ...(isBlank(values.addressText) ? {} : { addressText: values.addressText }),
        ...(country ? { country } : {}),
        ...(subdivision ? { subdivision } : {}),
        ...(isBlank(values.postalCode) ? {} : { postalCode: values.postalCode }),
    };
    return Object.keys(geography).length > 0 ? geography : undefined;
}

function toPosition(values: PartyLocationFormValues): GeographicPosition | undefined {
    if (!hasPositionInput(values) || !values.precision) return undefined;
    const point = parseGeographicPoint(
        parseDecimal(values.latitude),
        parseDecimal(values.longitude),
    );
    if (!point) return undefined;
    const accuracyMetres = isBlank(values.accuracyMetres)
        ? undefined
        : parseDecimal(values.accuracyMetres);
    return {
        point,
        precision: values.precision,
        ...(accuracyMetres === undefined ? {} : { accuracyMetres }),
    };
}

function toEvidence(values: PartyLocationFormValues): PartyLocationEvidenceInput | undefined {
    if (isBlank(values.evidenceReference)) return undefined;
    const observedAt = parseUtcDay(values.evidenceObservedOn);
    return {
        reference: values.evidenceReference,
        scope: values.evidenceScope,
        ...(observedAt ? { observedAt } : {}),
    };
}

function sortedRoles(values: PartyLocationFormValues) {
    return PARTY_LOCATION_ROLES.filter((role) => values.roles.includes(role));
}

export function buildCreatePartyLocationInput(
    values: PartyLocationFormValues,
    relocates?: CreatePartyLocationInput["relocates"],
): CreatePartyLocationInput {
    const geography = toGeography(values);
    const position = toPosition(values);
    const evidence = toEvidence(values);
    return {
        label: values.label.trim(),
        roles: sortedRoles(values),
        ...(geography ? { geography } : {}),
        ...(position ? { position } : {}),
        ...(evidence ? { evidence } : {}),
        ...(relocates ? { relocates } : {}),
    };
}

const same = (left: unknown, right: unknown) =>
    JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

/**
 * Same-location correction containing only the groups the draft changed relative to `original`,
 * the location as it was when editing began. Unchanged groups are omitted so concurrent edits and
 * values this app cannot display stay intact; a cleared group is sent as `null`. Returns
 * `undefined` when nothing changed.
 */
export function buildCorrectPartyLocationInput(
    values: PartyLocationFormValues,
    original: PartyLocation,
    expectedRevision: number,
): CorrectPartyLocationInput | undefined {
    const before = toPartyLocationFormValues(original);
    const label = values.label.trim();
    const roles = sortedRoles(values);
    const geography = toGeography(values);
    const position = toPosition(values);
    const evidence = toEvidence(values);

    const input: CorrectPartyLocationInput = {
        expectedRevision,
        ...(label === before.label.trim() ? {} : { label }),
        ...(same(roles, sortedRoles(before)) ? {} : { roles }),
        ...(same(geography, toGeography(before)) ? {} : { geography: geography ?? null }),
        ...(same(position, toPosition(before)) ? {} : { position: position ?? null }),
        ...(same(evidence, toEvidence(before)) ? {} : { evidence: evidence ?? null }),
    };
    return Object.keys(input).length > 1 ? input : undefined;
}
