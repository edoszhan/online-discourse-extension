# from openai import OpenAI

# def generate_topics(text):
#     client = OpenAI(api_key="sk-proj-eODmV7FSvYlvreH8allAT3BlbkFJiFa9zY9vrJA8yKlwaEc8") 

#     prompt = f"Please generate 3 topics based on the following article text:\n\n{text}\n\nTopics:"

#     chat_completion = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": "You are a helpful assistant that generates topics based on given text."},
#             {"role": "user", "content": prompt}
#         ],
#         max_tokens=10,
#         n=1,
#         stop=None,
#         temperature=0.7,
#     )

#     topics = chat_completion.choices[0].message.content.strip().split("\n")
#     return topics


import time
from openai import OpenAI, APIError

def generate_topics(text, max_retries=3, delay=1):
    client = OpenAI(api_key="sk-proj-eODmV7FSvYlvreH8allAT3BlbkFJiFa9zY9vrJA8yKlwaEc8") 

    prompt = f"Please generate 3 topics based on the following article text:\n\n{text}\n\nTopics:"

    retries = 0
    while retries < max_retries:
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates topics based on given text."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=10,
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
                delay *= 2  # Exponential backoff
            else:
                raise e

    raise Exception("Failed to generate topics after multiple retries.")