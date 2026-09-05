with open("src/app/page.tsx", "r") as f:
    c = f.read()

old_destruct = "const { status, current_stage, stages } = runState;"
new_destruct = "const { status, current_stage, stages = {} } = runState;"

c = c.replace(old_destruct, new_destruct)

old_parse = """          if (!part.trim()) continue;
          try {
            const parsed = JSON.parse(part.trim());
            // Prevent state updates if canceled
            setRunState((current: any) => isCanceled ? current : parsed);
          } catch(e) {}"""
new_parse = """          if (!part.trim()) continue;
          try {
            const parsed = JSON.parse(part.trim());
            if (parsed.error_code) {
               addToast(parsed.message || "Pipeline error", "ERROR");
               setRunState((prev: any) => ({ ...prev, status: "FAILED" }));
               return;
            }
            // Prevent state updates if canceled
            setRunState((current: any) => isCanceled ? current : parsed);
          } catch(e) {}"""
c = c.replace(old_parse, new_parse)

old_buffer_parse = """      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          setRunState((current: any) => isCanceled ? current : parsed);
        } catch(e) {}
      }"""
new_buffer_parse = """      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          if (parsed.error_code) {
             addToast(parsed.message || "Pipeline error", "ERROR");
             setRunState((prev: any) => ({ ...prev, status: "FAILED" }));
             return;
          }
          setRunState((current: any) => isCanceled ? current : parsed);
        } catch(e) {}
      }"""
c = c.replace(old_buffer_parse, new_buffer_parse)

# Also check res.ok before reading stream
old_fetch = """      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pipeline/run`, {
        method: "POST",
        body: formData
      });
      
      if (!res.body) throw new Error("No response body stream");"""
new_fetch = """      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pipeline/run`, {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
         try {
            const errJson = await res.json();
            addToast(errJson.message || "Pipeline execution failed", "ERROR");
         } catch(e) {
            addToast(`HTTP Error ${res.status}`, "ERROR");
         }
         setRunState((prev: any) => ({ ...prev, status: "FAILED", stages: prev?.stages || {} }));
         return;
      }
      
      if (!res.body) throw new Error("No response body stream");"""
c = c.replace(old_fetch, new_fetch)

with open("src/app/page.tsx", "w") as f:
    f.write(c)
