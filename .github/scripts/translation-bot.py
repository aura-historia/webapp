import os
import json
import sys
import subprocess
from openai import OpenAI

# --- CONFIGURATION ---
# We default to Azure endpoint for GitHub Models, but this works with standard OpenAI too
client = OpenAI(
    base_url=os.environ.get('OPENAI_BASE_URL', 'https://models.inference.ai.azure.com'),
    api_key=os.environ.get('GITHUB_TOKEN') or os.environ.get('OPENAI_API_KEY'),
)

source_path = os.environ.get('SOURCE_FILE', 'src/i18n/locales/en/translation.json')
target_langs = os.environ.get('TARGET_LANGS', '').split(',')

# --- HELPER FUNCTIONS ---

def load_json_file(path):
    if not os.path.exists(path): return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_previous_source():
    '''Load the version of the source file from the previous commit (HEAD^).'''
    try:
        # Check if we are in a git repo
        if not os.path.exists('.git'):
            return {}

        # relative path needs to be handled carefully with git show
        # We look at the file relative to the root of the repo
        cmd = ['git', 'show', f'HEAD^:./{source_path}']
        json_str = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode('utf-8')
        return json.loads(json_str)
    except Exception:
        # If file was created in this commit, or no git history (shallow fetch), return empty
        return {}

def get_processing_delta(curr_src, prev_src, curr_target):
    '''
    Identifies keys that need translation because they are:
    1. New (missing in target)
    2. Modified (changed in source vs previous source)
    '''
    delta = {}
    for key, value in curr_src.items():
        if isinstance(value, dict):
            prev_val = prev_src.get(key, {}) if isinstance(prev_src.get(key), dict) else {}
            target_val = curr_target.get(key, {}) if isinstance(curr_target.get(key), dict) else {}

            nested_delta = get_processing_delta(value, prev_val, target_val)
            if nested_delta:
                delta[key] = nested_delta
        else:
            # Case A: Missing entirely in target
            if key not in curr_target:
                delta[key] = value
            # Case B: Changed in Source since last commit
            elif key in prev_src and prev_src[key] != value:
                print(f'  >> Modification detected: {key}')
                delta[key] = value
    return delta

def cleanup_obsolete(source, target):
    '''
    Recursively removes keys from target that are not in source.
    Returns True if any key was actually deleted.
    '''
    modifications = False
    keys_to_del = [k for k in target if k not in source]

    if keys_to_del:
        modifications = True
        for k in keys_to_del:
            del target[k]

    for k, v in target.items():
        if isinstance(v, dict) and k in source and isinstance(source[k], dict):
            if cleanup_obsolete(source[k], v):
                modifications = True

    return modifications

def deep_merge(target, delta):
    '''Updates target dict with values from delta'''
    for key, value in delta.items():
        if key in target and isinstance(target[key], dict) and isinstance(value, dict):
            deep_merge(target[key], value)
        else:
            target[key] = value

def translate_delta(data, lang):
    prompt = (
        f'Translate the following JSON values from English to {lang}. '
        f'Try to keep the tone as it is in English. This is for a SaaS in the antiques business and requires extreme precision and quality.'
        f'Return valid JSON only. Preserve keys exactly.'
    )
    try:
        response = client.chat.completions.create(
            messages=[
                {'role': 'system', 'content': prompt},
                {'role': 'user', 'content': json.dumps(data)}
            ],
            model='gpt-4o',
            temperature=0.1
        )
        content = response.choices[0].message.content
        if content.startswith('```json'):
            content = content.split('\n', 1)[1].rsplit('\n', 1)[0]
        return json.loads(content)
    except Exception as e:
        print(f"API Error: {e}")
        raise

# --- MAIN EXECUTION ---

def main():
    if not target_langs or target_langs == ['']:
        print("Error: TARGET_LANGS environment variable not set.")
        sys.exit(1)

    print(f'Loading source: {source_path}')
    current_source = load_json_file(source_path)
    previous_source = load_previous_source()

    base_dir = os.path.dirname(os.path.dirname(source_path))
    global_changes = False

    for lang in target_langs:
        print(f'--- Processing {lang} ---')
        target_dir = os.path.join(base_dir, lang)
        target_file = os.path.join(target_dir, 'translation.json')

        target_data = load_json_file(target_file)

        # 1. Calc what needs translation (New + Modified)
        delta = get_processing_delta(current_source, previous_source, target_data)

        # 2. Cleanup deleted keys
        was_cleaned = cleanup_obsolete(current_source, target_data)

        # 3. Translate if needed
        if delta:
            print(f'Translating {len(delta)} items...')
            try:
                translated_delta = translate_delta(delta, lang)
                deep_merge(target_data, translated_delta)
            except Exception as e:
                print(f'❌ Error translating {lang}: {e}')
                sys.exit(1)

        # 4. Save logic
        if delta or was_cleaned:
            print(f'Saving changes to {lang}/translation.json')
            os.makedirs(target_dir, exist_ok=True)
            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump(target_data, f, ensure_ascii=False, indent=2)
            global_changes = True
        else:
            print(f'No changes required for {lang}.')

    if not global_changes:
        print('No changes applied to any file.')

if __name__ == "__main__":
    main()