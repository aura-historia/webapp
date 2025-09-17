import { makeData } from "../demo-table-data";

describe("makeData", () => {
    it("creates data with the correct structure for a single level", () => {
        const data = makeData(5);
        expect(data).toHaveLength(5);
        data.forEach((person, index) => {
            expect(person).toHaveProperty("id", index);
            expect(person).toHaveProperty("firstName");
            expect(person).toHaveProperty("lastName");
            expect(person).toHaveProperty("age");
            expect(person).toHaveProperty("visits");
            expect(person).toHaveProperty("progress");
            expect(person).toHaveProperty("status");
            expect(person.subRows).toBeUndefined();
        });
    });

    it("creates nested data with the correct structure", () => {
        const data = makeData(3, 2);
        expect(data).toHaveLength(3);
        for (const person of data) {
            expect(person.subRows).toHaveLength(2);
            for (const subPerson of person.subRows) {
                expect(subPerson).toHaveProperty("id");
                expect(subPerson).toHaveProperty("firstName");
                expect(subPerson).toHaveProperty("lastName");
                expect(subPerson).toHaveProperty("age");
                expect(subPerson).toHaveProperty("visits");
                expect(subPerson).toHaveProperty("progress");
                expect(subPerson).toHaveProperty("status");
                expect(subPerson.subRows).toBeUndefined();
            }
        }
    });

    it("returns an empty array when no lengths are provided", () => {
        const data = makeData();
        expect(data).toEqual([]);
    });

    it("handles zero-length levels correctly", () => {
        const data = makeData(0, 5);
        expect(data).toEqual([]);
    });

    it("handles deeply nested structures", () => {
        const data = makeData(2, 2, 2);
        expect(data).toHaveLength(2);
        for (const person of data) {
            expect(person.subRows).toHaveLength(2);
            for (const subPerson of person.subRows) {
                expect(subPerson.subRows).toHaveLength(2);
                for (const subSubPerson of subPerson.subRows) {
                    expect(subSubPerson.subRows).toBeUndefined();
                }
            }
        }
    });
});
