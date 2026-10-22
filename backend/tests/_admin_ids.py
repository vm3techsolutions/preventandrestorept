# Resolve QA admin IDs dynamically (they change when QA admins are recreated via CLI)
import subprocess


def admin_id(email):
    js = ("require('dotenv').config();const p=require('./src/lib/prisma');(async()=>{const a=await p.admin.findUnique({where:{email:'%s'}});"
          "console.log(a?a.id:0);await p.$disconnect()})()" % email)
    out = subprocess.run(['node', '-e', js], cwd='/app/server', capture_output=True, text=True).stdout.strip().splitlines()
    return int(out[-1]) if out else 0
