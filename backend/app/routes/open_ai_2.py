import os
import time
from openai import OpenAI, APIError

def generate_summary(comments, max_retries=2, delay=1):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY env var is not set.")
    
    client = OpenAI(api_key=api_key) 

    prompt = f"Please summarize the following comments from the third perspective while paraphrasing bad words:\n\n{comments}\n\nSummary:"

    retries = 0
    while retries < max_retries:
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes comments from a neutral perspective."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                n=1,
                stop=None,
                temperature=0.7, 
            )
            summary = chat_completion.choices[0].message.content.strip()
            return summary
        except APIError as e:
            if e.status_code == 429:  
                retries += 1
                print(f"Rate limit exceeded. Retrying in {delay} seconds... (Attempt {retries}/{max_retries})")
                time.sleep(delay)
                delay *= 2 # arbitrary number
            else:
                raise e

    raise Exception("Failed to generate summary after multiple retries.")
