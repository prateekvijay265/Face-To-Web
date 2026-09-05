with open("app/services/matcher_service.py", "r") as f:
    c = f.read()

c = c.replace('candidate.match_status = "MATCH_CONFIRMED"', 'candidate.match_status = "MATCH"')

with open("app/services/matcher_service.py", "w") as f:
    f.write(c)
