import re, math, json, sys
def load(p):
    s=open(p).read()
    return [(float(a),float(b),float(c)) for a,b,c in re.findall(r'<trkpt lat="([-\d.]+)" lon="([-\d.]+)">\s*<ele>([-\d.]+)</ele>',s)]
def hav(a,b):
    p1,p2=math.radians(a[0]),math.radians(b[0]);dl=math.radians(b[1]-a[1])
    h=math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*6371000*math.asin(math.sqrt(h))
C={"Cavona":(45.9054,8.7566),"Rancio":(45.916,8.771),"Cassano":(45.93127,8.76361),"Vallalta":(45.92823,8.75042),"SanMartino":(45.9266,8.7446),"Arcumeggia":(45.91719,8.71616),"Vergobbio":(45.90827,8.72742),"Duno":(45.9142,8.73788)}
# (nome, nota, punto: 0 | 1 | chiave di C, tipi)
WP={"25":[("Cuvio","Partenza",0,["start"]),("Cavona",None,"Cavona",["pass"]),("Rancio Valcuvia",None,"Rancio",["pass"]),("Cassano Valcuvia","Ristoro solo liquidi","Cassano",["liquid"]),("Vallalta","Ristoro · cancello 3 h","Vallalta",["food","gate"]),("San Martino","1.087 m · vetta","SanMartino",["top"]),("Arcumeggia","Ristoro","Arcumeggia",["food"]),("Vergobbio",None,"Vergobbio",["pass"]),("Cuvio","Arrivo · ristoro",1,["end"])],
    "12":[("Cassano Valcuvia","Partenza",0,["start"]),("Vallalta","circa 830 m","Vallalta",["top"]),("Duno",None,"Duno",["pass"]),("Cuvio","Arrivo · ristoro",1,["end"])],
    "7":[("Cuvio","Partenza",0,["start"]),("Cavona",None,"Cavona",["pass"]),("Cuvio","Arrivo",1,["end"])]}
OFF={"25":25,"12":12,"7":7}
out={}
for key,p in zip(["25","12","7"],sys.argv[1:4]):
    raw=load(p)
    e=[x[2] for x in raw]; w=12
    es=[sum(e[max(0,i-w):i+w+1])/len(e[max(0,i-w):i+w+1]) for i in range(len(e))]
    pts=[];last=None
    for i,x in enumerate(raw):
        if last is None or hav(last,x)>=35 or i==len(raw)-1: pts.append((x[0],x[1],es[i])); last=x
    d=[0]
    for i in range(1,len(pts)): d.append(d[-1]+hav(pts[i-1],pts[i]))
    L=d[-1]; N=200; prof=[];j=0
    for k in range(N+1):
        t=L*k/N
        while j<len(d)-2 and d[j+1]<t: j+=1
        f=(t-d[j])/(d[j+1]-d[j]) if d[j+1]>d[j] else 0
        prof.append(round(pts[j][2]+(pts[j+1][2]-pts[j][2])*f))
    trk=[[round(x[0],5),round(x[1],5),round(d[i]/L,4)] for i,x in enumerate(pts)]
    out[key]={"km":OFF[key],"min":min(prof),"max":max(prof),"profile":prof,"track":trk,
      "wp":[]}
    for n,no,pt,t in WP[key]:
        if pt in (0,1): f=float(pt)
        else:
            c=C[pt]; i=min(range(len(pts)),key=lambda i:hav(pts[i],c)); f=round(d[i]/L,4)
        out[key]["wp"].append({"name":n,"note":no,"f":f,"t":t})
    print(key,len(trk),min(prof),max(prof))
open(sys.argv[4],'w').write("/* Generato dai GPX ufficiali. Profilo: 201 campioni equidistanti (m s.l.m.). Traccia: [lat, lon, frazione percorsa]. */\nwindow.ROUTES="+json.dumps(out,separators=(',',':'))+";\n")
