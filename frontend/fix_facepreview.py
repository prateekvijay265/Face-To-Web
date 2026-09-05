with open("src/app/page.tsx", "r") as f:
    c = f.read()

old_render = """<FacePreview 
                    imageUrl={previewUrl} 
                    faceCount={data.face ? data.face.face_count : (runState?.stages?.FACE_DETECTION?.status === "PROCESSING" ? -1 : 1)}
                  />"""

new_render = """<FacePreview 
                    imageUrl={previewUrl} 
                    faceCount={data.face ? data.face.face_count : (runState?.stages?.FACE_DETECTION?.status === "SUCCESS" ? 1 : (runState?.stages?.FACE_DETECTION?.status === "PROCESSING" || runState?.status === "RUNNING" ? -1 : 0))}
                  />"""

c = c.replace(old_render, new_render)

with open("src/app/page.tsx", "w") as f:
    f.write(c)
