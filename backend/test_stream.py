import asyncio
import os
import aiohttp
import json

async def test_stream():
    url = "http://127.0.0.1:8000/api/pipeline/run"
    
    with open("test_face.png", "rb") as f:
        image_bytes = f.read()

    data = aiohttp.FormData()
    data.add_field('image', image_bytes, filename='test_face.png', content_type='image/png')
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=data) as resp:
            print(f"Status: {resp.status}")
            async for line in resp.content:
                if line.strip():
                    print("CHUNK:", line.decode().strip())

if __name__ == "__main__":
    asyncio.run(test_stream())
