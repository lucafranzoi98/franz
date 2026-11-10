import math, random, sys
random.seed(int(sys.argv[2]))
W,H=1600,1000; NX,NY=160,100
hills=[(random.uniform(-200,W+200),random.uniform(-200,H+200),random.uniform(120,420),random.uniform(-1,1.6)) for _ in range(16)]
def f(x,y):
    v=0
    for cx,cy,r,a in hills:
        v+=a*math.exp(-((x-cx)**2+(y-cy)**2)/(2*r*r))
    v+=0.15*math.sin(x/170)+0.12*math.cos(y/130+x/400)
    return v
gx=[[f(i*W/NX,j*H/NY) for i in range(NX+1)] for j in range(NY+1)]
lo=min(min(r) for r in gx);hi=max(max(r) for r in gx)
levels=[lo+(hi-lo)*k/22 for k in range(1,22)]
def interp(p1,p2,v1,v2,l):
    t=(l-v1)/(v2-v1) if v2!=v1 else .5
    return (round(p1[0]+t*(p2[0]-p1[0]),1),round(p1[1]+t*(p2[1]-p1[1]),1))
paths=[]
for li,l in enumerate(levels):
    segs=[]
    for j in range(NY):
        for i in range(NX):
            P=[(i*W/NX,j*H/NY),((i+1)*W/NX,j*H/NY),((i+1)*W/NX,(j+1)*H/NY),(i*W/NX,(j+1)*H/NY)]
            V=[gx[j][i],gx[j][i+1],gx[j+1][i+1],gx[j+1][i]]
            pts=[]
            for a,b in [(0,1),(1,2),(2,3),(3,0)]:
                if (V[a]<l)!=(V[b]<l): pts.append(interp(P[a],P[b],V[a],V[b],l))
            if len(pts)==2: segs.append(tuple(pts))
            elif len(pts)==4: segs.append((pts[0],pts[1]));segs.append((pts[2],pts[3]))
    # join
    from collections import defaultdict
    adj=defaultdict(list)
    for k,(a,b) in enumerate(segs): adj[a].append(k);adj[b].append(k)
    used=[False]*len(segs)
    for k in range(len(segs)):
        if used[k]: continue
        used[k]=True; line=[segs[k][0],segs[k][1]]
        for end in (1,0):
            while True:
                tip=line[-1] if end else line[0]; nxt=None
                for m in adj[tip]:
                    if not used[m]: nxt=m;break
                if nxt is None: break
                used[nxt]=True; a,b=segs[nxt]; q=b if a==tip else a
                if end: line.append(q)
                else: line.insert(0,q)
        if len(line)<6: continue
        line=line[::2]+([line[-1]] if len(line)%2==0 else [])
        d=f"M{line[0][0]:.0f} {line[0][1]:.0f}"
        for p in range(1,len(line)-1):
            mx=(line[p][0]+line[p+1][0])/2;my=(line[p][1]+line[p+1][1])/2
            d+=f"Q{line[p][0]:.0f} {line[p][1]:.0f} {mx:.0f} {my:.0f}"
        paths.append((li%5==0,d))
out=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="{sys.argv[3]}" stroke-linecap="round">'
out+='<path stroke-width="1" d="'+"".join(d for idx,d in paths if not idx)+'"/>'
out+='<path stroke-width="2" d="'+"".join(d for idx,d in paths if idx)+'"/>'
out+='</g></svg>'
open(sys.argv[1],'w').write(out); print(len(paths),len(out))
