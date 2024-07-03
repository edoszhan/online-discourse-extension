import os
import time
from openai import OpenAI, APIError

def generate_topics(text, max_retries=2, delay=1):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY env var is not set.")
    
    client = OpenAI(api_key=api_key) 

    prompt = f"Please generate 3 diverse and distinct topics based on the following article text. Each topic should be suitable for generating discussion among users and should be represented by a minimum of 5 words and a maximum of 10 words:\n\n{text}\n\nTopics:"

    retries = 0
    while retries < max_retries:
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates topics based on given text."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=30,
                n=1,
                stop=None,
                temperature=0.7, 
            )
            topics = chat_completion.choices[0].message.content.strip().split("\n")
            return topics
        except APIError as e:
            if e.status_code == 429:  
                retries += 1
                print(f"Rate limit exceeded. Retrying in {delay} seconds... (Attempt {retries}/{max_retries})")
                time.sleep(delay)
                delay *= 2 # arbitrary number
            else:
                raise e

    raise Exception("Failed to generate topics after multiple retries.")