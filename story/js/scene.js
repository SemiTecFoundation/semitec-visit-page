/* Stable WebGL geometry: uploaded once. Navigation never rebuilds the chip. */
class SignalScene {
  constructor(canvas,onError){
    this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});
    if(!this.gl)throw new Error('WebGL is unavailable');
    const css=getComputedStyle(document.documentElement);
    const color=(key,fallback)=>{const h=css.getPropertyValue(key).trim()||fallback;return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);};
    this.palette={board:color('--chip-board','#10232a'),chip:color('--chip-body','#21383e'),metal:color('--chip-metal','#526264'),gold:color('--chip-signal','#eac883'),teal:color('--chip-trace','#397b80'),fog:color('--chip-fog','#071419')};
    this.active=true;this.mesh=[];this.buildPrograms();this.buildWorld();this.buildDetail();this.buildEvents();this.buildFinale();
    this.worldBuffer=this.upload(this.mesh);this.worldCount=this.mesh.length/10;
    this.mesh=[];this.buildLoop();this.loopBuffer=this.upload(this.mesh);this.loopCount=this.mesh.length/10;this.mesh=null;
    this.sparkBuffer=this.gl.createBuffer();this.resize();
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.active=false;onError();});
  }
  upload(vertices){const gl=this.gl,buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);return buffer;}
  shader(type,source) {
    const gl=this.gl,shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  program(vertex,fragment) {
    const gl=this.gl,program=gl.createProgram();gl.attachShader(program,this.shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,this.shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    return program;
  }
  buildPrograms() {
    const gl=this.gl;
    this.main=this.program(`
      attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute float aEmission;
      uniform mat4 uMatrix;uniform mat4 uModel;uniform mediump vec3 uEye;
      varying vec3 vWorld;varying vec3 vNormal;varying vec3 vColor;varying float vEmission;varying float vDistance;
      void main(){vec3 world=(uModel*vec4(aPosition,1.0)).xyz;vWorld=world;vNormal=mat3(uModel)*aNormal;vColor=aColor;vEmission=aEmission;vDistance=distance(world,uEye);gl_Position=uMatrix*vec4(world,1.0);}
    `,`
      precision mediump float;
      varying vec3 vWorld;varying vec3 vNormal;varying vec3 vColor;varying float vEmission;varying float vDistance;
      uniform float uTime;uniform float uOpacity;uniform vec3 uFog;uniform float uSignalZ;uniform float uSignalX;uniform mediump vec3 uEye;uniform float uLevel;uniform float uPower;
      void main(){
        vec3 n=normalize(vNormal);vec3 view=normalize(uEye-vWorld);
        float light=.52+.60*max(dot(n,normalize(vec3(-.5,1.,.65))),0.);
        float rim=pow(1.-max(dot(n,view),0.),3.);
        vec3 color=vColor*light+vec3(.025,.065,.07)*rim;
        float nearSignal=exp(-abs(vWorld.z-uSignalZ)*.24)*exp(-abs(vWorld.x-uSignalX)*.18);
        color+=vec3(.23,.12,.035)*nearSignal*max(n.y,0.);
        if(vEmission>.1){
          float flow=.75+.25*pow(.5+.5*sin(vWorld.z*.55+uTime*2.6),7.);
          vec3 base=mix(vColor,vec3(.42,.86,.84),uLevel*step(1.5,vEmission)); // DUAL: level-2 loops get a teal signal lane
          color=base*(vEmission>1.5 ? flow : .9);
          color+=base*nearSignal*.5;
          color+=base*uPower*(.55+.45*sin(uTime*3.+vWorld.z*.3)); // DUAL: power-on, every trace brightens
        }
        color+=vec3(.05,.035,.01)*uPower;
        float fog=1.-exp(-pow(vDistance/125.,1.65));
        color=mix(color,uFog,clamp(fog,0.,.98));
        gl_FragColor=vec4(color,uOpacity);
      }
    `);
    this.attributes={};['Position','Normal','Color','Emission'].forEach(key=>this.attributes[key]=gl.getAttribLocation(this.main,'a'+key));
    this.uniforms={};['Matrix','Model','Opacity','Fog','Eye','Time','SignalZ','SignalX','Level','Power'].forEach(key=>this.uniforms[key]=gl.getUniformLocation(this.main,'u'+key));
    this.sparks=this.program(`
      attribute vec3 aPosition;attribute float aSize;attribute vec3 aColor;
      uniform mat4 uMatrix;uniform float uHeight;varying vec3 vColor;
      void main(){vec4 p=uMatrix*vec4(aPosition,1.);gl_Position=p;gl_PointSize=clamp(aSize*uHeight/max(p.w,1.),1.,110.);vColor=aColor;}
    `,`
      precision mediump float;varying vec3 vColor;
      void main(){vec2 p=gl_PointCoord-.5;float r=length(p)*2.;if(r>1.)discard;float glow=pow(1.-r,3.);float core=exp(-r*r*90.);gl_FragColor=vec4(vColor,glow*.65+core);}
    `);
    this.sparkAttributes={position:gl.getAttribLocation(this.sparks,'aPosition'),size:gl.getAttribLocation(this.sparks,'aSize'),color:gl.getAttribLocation(this.sparks,'aColor')};
    this.sparkUniforms={matrix:gl.getUniformLocation(this.sparks,'uMatrix'),height:gl.getUniformLocation(this.sparks,'uHeight')};
  }
  path(z) {return chipPath(z);}
  vertex(p,n,color,emission){this.mesh.push(...p,...n,...color,emission);}
  quad(a,b,c,d,n,color,emission=0){for(const p of [a,b,c,a,c,d])this.vertex(p,n,color,emission);}
  box(x,y,z,w,h,d,color,emission=0) {
    const l=x-w/2,r=x+w/2,f=z+d/2,b=z-d/2,t=y+h,o=y;
    this.quad([l,t,f],[r,t,f],[r,t,b],[l,t,b],[0,1,0],color,emission);
    this.quad([l,o,f],[r,o,f],[r,t,f],[l,t,f],[0,0,1],color,emission);
    this.quad([r,o,b],[l,o,b],[l,t,b],[r,t,b],[0,0,-1],color,emission);
    this.quad([r,o,f],[r,o,b],[r,t,b],[r,t,f],[1,0,0],color,emission);
    this.quad([l,o,b],[l,o,f],[l,t,f],[l,t,b],[-1,0,0],color,emission);
  }
  beam(a,b,width,color,emission=0) {
    const direction=sub(b,a);let right=cross(direction,[0,1,0]);
    if(length(right)<.001)right=[1,0,0];right=scale(normalize(right),width/2);
    const up=scale(normalize(cross(right,direction)),width/2);
    const corners=p=>[add(add(p,right),up),add(sub(p,right),up),sub(sub(p,right),up),add(sub(p,up),right)];
    const c=corners(a),d=corners(b);
    for(let i=0;i<4;i++){const j=(i+1)%4,n=normalize(cross(sub(c[j],c[i]),sub(d[j],c[i])));this.quad(c[i],c[j],d[j],d[i],n,color,emission);}
  }
  trace(points,width,color,emission=0){for(let i=1;i<points.length;i++)this.beam(points[i-1],points[i],width,color,emission);}
  chip(x,z,w,d,h,seed) {
    const shell=this.palette.chip,metal=this.palette.metal,copper=this.palette.gold;
    this.box(x,.08,z,w+1,.32,d+1,[.14,.25,.26]);
    this.box(x,.4,z,w,h,d,shell);
    this.box(x,.4+h,z,w-.6,.18,d-.6,[.19,.29,.30]);
    this.box(x,h+.6,z,w*.67,.14,d*.68,[.08,.16,.18]);
    // Nested routing on the silicon surface and fine gold contacts at its edges.
    for(let i=0;i<4;i++){
      const inset=1+i*.47;
      this.trace([[x-w/2+inset,h+.8,z+d/2-inset],[x+w/2-inset,h+.8,z+d/2-inset],[x+w/2-inset,h+.8,z-d/2+inset]],.035,[.24,.44,.44],1);
    }
    for(let k=0;k<Math.floor(d/.95);k++){
      const zz=z-d/2+.5+k*.95;
      for(const side of [-1,1]){
        this.box(x+side*(w/2+.45),.2,zz,.95,.18,.32,metal);
        this.box(x+side*(w/2+.8),.06,zz,.38,.14,.32,copper);
      }
    }
    const front=z+d/2+.012;
    for(let i=0;i<5;i++){
      const xx=x-w*.36+i*w*.18;
      this.trace([[xx,.5,front],[xx,h*.45,front],[xx+.5,h*.45+.5,front],[xx+.5,h+.2,front]],.035,seed%2?[.30,.57,.56]:[.65,.47,.24],1);
      this.box(xx+.5,h*.5,front,.14,.14,.03,[.68,.76,.69],1);
    }
    // Small face plate suggests a packaged IC rather than a building.
    this.box(x,h*.54,front+.03,w*.6,.4,.04,[.16,.28,.29]);
    for(let i=0;i<7;i++)this.box(x-w*.23+i*w*.075,h*.64,front+.06,.06,.16,.035,[.36,.51,.49],1);
  }
  buildWorld() {
    const gold=this.palette.gold,teal=this.palette.teal,quiet=[.075,.19,.21];
    const far=JOURNEY_SETTINGS.initialZ-(SITE_CONTENT.sections.length-1)*JOURNEY_SETTINGS.sectionSpacing-90;
    // DUAL: the die ends at a seal ring just after the last section; beyond it are the bond pads and the package
    const endZ=JOURNEY_SETTINGS.initialZ-(SITE_CONTENT.sections.length-1)*JOURNEY_SETTINGS.sectionSpacing,sealZ=endZ-15;
    this.box(0,-.45,far/2,600,.45,Math.abs(far)+240,this.palette.board);
    // Copper routing below the camera: long traces turn gently with the signal lane.
    for(let lane=-12;lane<=12;lane++){
      if(Math.abs(lane)>=8)continue; // DUAL: the outer band now holds standard-cell rows (buildDetail)
      const points=[];
      for(let z=80;z>=sealZ+1;z-=2)points.push([this.path(z)+lane*1.38,.035,z]);
      this.trace(points,lane===0?.085:lane%4===0?.06:.024,lane===0?gold:lane%4===0?teal:quiet,lane===0?2:lane%4===0?1:0);
    }
    // Fine substrate grid and right-angle traces outside the central bus.
    for(let z=70;z>sealZ+4;z-=9){
      for(const s of [-1,1]){
        const x=this.path(z)+s*18;
        this.trace([[x,.02,z],[x+s*6,.02,z],[x+s*9,.02,z-3],[x+s*35,.02,z-3]],.025,[.13,.26,.27]);
      }
    }
    for(let i=0;i<Math.ceil(Math.abs(far)/33)+2;i++){
      const z=39-i*33;
      if(z<sealZ+8)continue;
      for(const side of [-1,1]){
        if(side>0&&this.memorySites().some(m=>Math.abs(z-m.memZ)<24))continue; // MEMORY: keep the right side free for memory blocks
        const x=this.path(z)+side*(side<0?91:19+(i%3)*1.2),h=3.1+(i%4)*1.1;
        this.chip(x,z,10+(i%3),14,h,i);
        this.chip(x+side*19,z-9,11,20,8+(i%3)*2,i+1);
        // Stacked memory / capacitor banks, with visible gaps between layers.
        if(side<0)for(let layer=0;layer<5;layer++)this.box(x+side*33,layer*1.15+.2,z,12,.85,18,[.09+layer*.014,.19+layer*.012,.21+layer*.012]);
        else this.memoryMacro(x+side*33,z,12,18); // DUAL: an SRAM block — bit-cell array, row decoder, sense amplifiers
        for(let j=0;j<5;j++){
          const xx=this.path(z)+side*(8.8+j*.9);
          this.box(xx,.08,z+10,.48,.45,1.7,[.24,.31,.30]);
          this.box(xx,.54,z+10,.48,.035,.35,[.65,.51,.30]);
        }
        // Wire bonds arc from the upper die down to the substrate.
        for(let wire=0;wire<4;wire++){
          const points=[];
          for(let t=0;t<=16;t++){const u=t/16;points.push([x-side*5-side*u*4,h+.55-(h+.4)*u+Math.sin(u*Math.PI)*3,z-3+wire*1.3]);}
          this.trace(points,.045,[.62,.49,.29]);
        }
      }
    }
    this.gates=[];
    for(let i=0;i<SITE_CONTENT.sections.length-1;i++){
      if(i===SITE_CONTENT.sections.length-2)break; // DUAL: after the last section the die ends; the finale replaces this gate
      const z=JOURNEY_SETTINGS.initialZ-(i+1)*JOURNEY_SETTINGS.sectionSpacing-22,x=this.path(z),height=7.2+(i%3)*.6;
      this.gates.push({x,z,y:height});
      // Raised interconnects: the journey passes underneath, at trace level.
      for(const side of [-1,1]){
        this.box(x+side*6.8,0,z,1.4,height,1.8,[.20,.28,.28]);
        this.box(x+side*6.75,.2,z+1,1.6,.32,2.8,[.29,.38,.36]);
        this.beam([x+side*6.06,.4,z+.92],[x+side*6.06,height-.15,z+.92],.055,gold,2);
        this.box(x+side*6.8,height*.45,z+.93,.82,.08,.03,gold,1);
        for(let j=0;j<=i;j++)this.box(x+side*6.8,height*.54+j*.22,z+.94,.44,.07,.035,teal,1);
      }
      this.box(x,height,z,15,1,1.8,[.24,.32,.31]);
      this.beam([x-6.1,height-.05,z+.92],[x+6.1,height-.05,z+.92],.065,gold,2);
      for(let pin=0;pin<18;pin++)this.box(x-6.3+pin*.74,height+1,z,.18,.24,2.3,[.47,.48,.37]);
      // Lateral bus routes make each chamber part of a larger chip.
      for(let line=0;line<4;line++){
        const yy=height+.18+line*.2;
        this.trace([[x-44,yy,z-1],[x-10,yy,z-1],[x-7.5,yy,z],[x+7.5,yy,z],[x+11,yy,z-2],[x+45,yy,z-2]],.035,line%2?gold:teal,1);
      }
      for(let step=0;step<6;step++){
        const zz=z+3+step*.36,xx=this.path(zz);
        for(const side of [-1,1])this.box(xx+side*4.8,.018,zz,.7,.02,.06,gold,1);
      }
    }
  }

  /* DUAL chip detail: crossing metal layers (M1 across the path, M2 along it) with vias,
     and rows of standard cells between power rails on both sides of the signal bus. */
  buildDetail(){
    const n=SITE_CONTENT.sections.length,endZ=JOURNEY_SETTINGS.initialZ-(n-1)*JOURNEY_SETTINGS.sectionSpacing,sealZ=endZ-15;
    let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    const m1=[.30,.22,.15],via=[.42,.80,.78],rail=[.34,.42,.39],cellA=[.15,.25,.27],cellB=[.19,.30,.31],cellHi=[.36,.62,.6];
    // M1: short copper stripes across the path, under the M2 lanes, with a via where some cross
    for(let z=78;z>sealZ+2;z-=2.6){
      const x=this.path(z);
      this.beam([x-10.6,.018,z],[x+10.6,.018,z],.1,m1);
      for(let k=0;k<3;k++){const lane=Math.round((rnd()*2-1)*7);if(lane%4===0)continue;this.box(x+lane*1.38,.02,z,.2,.05,.2,via,1);}
    }
    // standard-cell rows: equal height, varying widths, power rails between rows
    for(const side of [-1,1])for(let r=0;r<3;r++){
      const off=side*(11.6+r*1.75);
      const railPts=[];for(let z=80;z>=sealZ+1;z-=3)railPts.push([this.path(z)+off+side*.85,.07,z]);
      this.trace(railPts,.06,rail);
      let z=80;
      while(z>sealZ+2){
        const w=.5+rnd()*1.5,zc=z-w/2,hi=rnd()<.05;
        this.box(this.path(zc)+off,0,zc,1.4,hi?.16:.09+rnd()*.04,w-.12,hi?cellHi:(rnd()<.5?cellA:cellB),hi?1:0);
        z-=w;
      }
    }
  }
  /* MEMORY: where a section sits on the main route; its memory block stands just after its gate */
  sectionSite(id){
    const idx=Math.max(1,SITE_CONTENT.sections.findIndex(s=>s.id===id));
    const z=JOURNEY_SETTINGS.initialZ-idx*JOURNEY_SETTINGS.sectionSpacing,memZ=z-34;
    return {idx,z,memZ,memX:this.path(memZ)+11};
  }
  eventsSite(){return this.sectionSite('events');}
  memorySites(){return (SITE_CONTENT.memoryBanks||[]).map(b=>({bank:b.id,color:b.color,...this.sectionSite(b.section)}));}
  /* MEMORY: the path is a timeline. Upcoming events = gold posts on the approach to Events
     (the soonest is met first). Every memory bank (gallery, projects, reports) is a memory block just
     after its section's gate, one lit cell per stored item. */
  buildEvents(){
    const gold=this.palette.gold,metal=this.palette.metal,site=this.eventsSite();
    const ev=window.ST&&ST.events?ST.events():{upcoming:[],past:[]};
    this.eventsGeo={markers:[],memories:[],site};
    const up=ev.upcoming.slice(0,4);
    up.forEach((e,k)=>{
      const z=site.z+7+(up.length-1-k)*4.6,x=this.path(z)+3.6;
      this.box(x,.02,z,1.2,.05,1.2,gold,1);
      this.beam([this.path(z)+.25,.05,z],[x-.6,.05,z],.05,gold,1);
      this.box(x,0,z,.3,2,.3,metal);
      this.box(x,2,z,.8,.25,.8,gold,2);
      this.eventsGeo.markers.push({id:e.id,point:[x,2.7,z]});
    });
    const tone={gold:[.93,.75,.42],teal:[.45,.85,.8],copper:[.88,.56,.37]};
    for(const m of this.memorySites()){
      const n=window.ST&&ST.memoryItems?ST.memoryItems(m.bank).length:0,lit=tone[m.color]||tone.gold;
      const size=Math.max(16,Math.ceil((n+1)/4)*4),cols=4,rows=size/cols,w=11,d=18,x=m.memX,z=m.memZ;
      this.box(x,.08,z,w+1,.3,d+1,[.12,.22,.24]);
      this.box(x+.8,.38,z,w-1.6,.6,d-1,[.10,.19,.21]);
      this.box(x-w/2+1,.38,z,1.2,.75,d-1,[.17,.27,.27]);                                   // row decoder
      for(let k=0;k<cols;k++)this.box(x+.8-(w-1.6)/2+(k+.5)*(w-1.6)/cols,.38,z+d/2-.9,1.6,.7,1,[.2,.31,.3]); // sense amps
      const cw=(w-2.4)/cols,cd=(d-3)/rows;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const k=r*cols+c,on=k<n,cx=x+.8-(w-1.6)/2+(c+.5)*(w-1.6)/cols,cz=z-d/2+.6+(r+.5)*cd;
        this.box(cx,.98,cz,cw*.82,on?.28:.1,cd*.78,on?lit:[.12,.23,.25],on?1:0);
      }
      this.beam([this.path(z+6),.05,z+6],[x-w/2,.05,z+6],.07,lit,1);                      // write port from the signal bus
      this.eventsGeo.memories.push({bank:m.bank,idx:m.idx,point:[x,2.4,z+d/2]});
    }
  }
  /* DUAL SRAM macro: a raised block with a bit-cell grid, a row decoder down one side and sense amps along the front */
  memoryMacro(x,z,w,d){
    const teal=this.palette.teal;
    this.box(x,.08,z,w+1,.3,d+1,[.12,.22,.24]);
    this.box(x+.9,.38,z,w-1.8,.5,d-1,[.10,.19,.21]);
    const top=.9,x0=x-w/2+2.2,x1=x+w/2-.6,z0=z-d/2+1.2,z1=z+d/2-2;
    for(let k=0;k<=10;k++){const zz=z0+(z1-z0)*k/10;this.beam([x0,top,zz],[x1,top,zz],.035,teal,1);}
    for(let k=0;k<=7;k++){const xx=x0+(x1-x0)*k/7;this.beam([xx,top,z0],[xx,top,z1],.035,[.55,.45,.28],1);}
    this.box(x-w/2+1.1,.38,z,1.4,.62,d-1,[.17,.27,.27]);                 // row decoder
    for(let k=0;k<8;k++)this.box(x0+(x1-x0)*(k+.5)/8,.38,z+d/2-1.1,.9,.55,1.2,[.2,.31,.3]); // sense amplifiers
  }
  /* DUAL finale: seal ring, a row of bond pads (partners & supporters) and wire bonds to package leads */
  buildFinale(){
    const gold=this.palette.gold,n=SITE_CONTENT.sections.length;
    const endZ=JOURNEY_SETTINGS.initialZ-(n-1)*JOURNEY_SETTINGS.sectionSpacing,ex=this.path(endZ),sealZ=endZ-15;
    const far=endZ-90;
    this.box(ex,0,(sealZ+far)/2,300,.03,Math.abs(far-sealZ),[.045,.1,.115]);        // package mould beyond the die
    this.beam([ex-80,.08,sealZ],[ex+80,.08,sealZ],.14,gold,1);                      // seal ring
    this.beam([ex-80,.07,sealZ-1.3],[ex+80,.07,sealZ-1.3],.1,this.palette.metal);
    /* the pad row: free gold pads, partners, supporters, free copper pads. Free pads have no wire bond. */
    const partners=SITE_CONTENT.partners||[],padZ=endZ-27,spacing=3.6;
    const row=[{free:'partner'},{free:'partner'},...partners.filter(p=>p.kind!=='supporter'),...partners.filter(p=>p.kind==='supporter'),{free:'supporter'},{free:'supporter'}];
    const count=row.length;
    this.finale={pads:[],title:[ex,5.2,padZ-2],endZ};
    row.forEach((p,k)=>{
      const off=k-(count-1)/2,x=ex+off*spacing,lx=ex+off*spacing*1.9,lz=padZ-17;
      const sup=p.free?p.free==='supporter':p.kind==='supporter';
      this.box(x,.02,padZ,3,.05,3,[.28,.34,.32]);                                   // passivation opening
      if(p.free){
        this.box(x,.05,padZ,2.4,.1,2.4,sup?[.36,.23,.16]:[.38,.32,.18]);             // free pad: dull, unbonded
        for(const [a,b] of [[[x-1.2,.17,padZ-1.2],[x+1.2,.17,padZ-1.2]],[[x+1.2,.17,padZ-1.2],[x+1.2,.17,padZ+1.2]],[[x+1.2,.17,padZ+1.2],[x-1.2,.17,padZ+1.2]],[[x-1.2,.17,padZ+1.2],[x-1.2,.17,padZ-1.2]]])
          this.beam(a,b,.06,sup?[.85,.5,.32]:gold,1);                                // glowing outline: "connect here"
        this.box(lx,.02,lz-3.5,1.5,.24,7,[.4,.4,.37]);                               // its package lead, waiting
      }else{
        this.box(x,.05,padZ,2.4,.22,2.4,sup?[.85,.5,.32]:gold,1);                    // bond pad: gold = partner, copper = supporter
        const pts=[];for(let t=0;t<=18;t++){const u=t/18;pts.push([x+(lx-x)*u,.32+Math.sin(u*Math.PI)*3.4,padZ+(lz-padZ)*u]);}
        this.trace(pts,.05,sup?[.8,.47,.3]:[.86,.69,.39],1);                        // wire bond (gold or copper)
        this.box(lx,.02,lz-3.5,1.5,.24,7,[.58,.58,.52]);                             // package lead
      }
      this.finale.pads.push({id:p.free?null:p.id,free:p.free||null,point:[x,.7,padZ]});
    });
    // the main trace runs on to the centre of the pad row
    this.trace([[ex,.04,sealZ+1],[ex,.04,padZ+1.4]],.085,gold,2);
  }
  buildLoop(){
    const points=[],gold=this.palette.gold;
    for(let i=0;i<=220;i++)points.push(localLoopPoint(i/220));
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],d=localLoopTangent(i/220),r=[-d[2],0,d[0]];
      const offset=(p,k)=>[p[0]+r[0]*k,.026,p[2]+r[2]*k];
      this.quad(offset(a,-3.1),offset(a,3.1),offset(b,3.1),offset(b,-3.1),[0,1,0],this.palette.board);
    }
    for(const lane of [-2.7,0,2.7]){
      const trace=points.map((p,i)=>{const d=localLoopTangent(i/220);return [p[0]-d[2]*lane,.055,p[2]+d[0]*lane];});
      this.trace(trace,lane===0?.075:.035,lane===0?gold:this.palette.teal,lane===0?2:1);
    }
    for(const t of [.26,.73]){
      const p=localLoopPoint(t),d=localLoopTangent(t),r=[-d[2],0,d[0]],a=add(p,scale(r,4.3)),b=sub(p,scale(r,4.3));
      for(const v of [a,b]){this.beam([v[0],0,v[2]],[v[0],6.7,v[2]],.55,this.palette.metal);this.beam([v[0]+.3,.2,v[2]],[v[0]+.3,6.4,v[2]],.04,gold,1);}
      this.beam([a[0],6.7,a[2]],[b[0],6.7,b[2]],.55,this.palette.chip);
      this.beam([a[0],6.4,a[2]],[b[0],6.4,b[2]],.05,gold,2);
    }
    for(const t of [.15,.38,.6,.85]){
      const p=localLoopPoint(t),d=localLoopTangent(t),x=p[0]-d[2]*9,z=p[2]+d[0]*9;
      this.box(x,.1,z,4,2.1,4,this.palette.chip);this.box(x,2.2,z,3.6,.18,3.6,this.palette.metal);
      for(let pin=0;pin<5;pin++)this.box(x-1.6+pin*.8,.1,z+2.4,.15,.15,.8,gold);
    }
  }
  resize(){const ratio=Math.min(devicePixelRatio||1,JOURNEY_SETTINGS.maxPixelRatio);this.width=innerWidth;this.height=innerHeight;this.canvas.width=Math.round(this.width*ratio);this.canvas.height=Math.round(this.height*ratio);this.gl.viewport(0,0,this.canvas.width,this.canvas.height);}
  bindMesh(buffer){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);let offset=0;for(const [name,size] of [['Position',3],['Normal',3],['Color',3],['Emission',1]]){const loc=this.attributes[name];gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,40,offset);offset+=size*4;}}
  render(frame,time){
    if(!this.active)return;
    const gl=this.gl,pose=frame.pose;
    // ▸DUAL frame.lift (0…1) raises the camera above the chip and tilts it to look down — used when switching to/from the 2D map.
    const lift=frame.lift||0,d=pose.direction;
    const eye=add(pose.point,[-d[0]*lift*16,JOURNEY_SETTINGS.cameraHeight+lift*lift*62+lift*6,-d[2]*lift*16]);
    const target=add(add(eye,scale(d,JOURNEY_SETTINGS.lookAhead*(1-lift*.72))),[0,.15-lift*(eye[1]-.2)*.96,0]);
    const projection=perspective((this.width<=760?68:JOURNEY_SETTINGS.fieldOfView)*Math.PI/180,this.width/this.height,.12,400);
    projection[8]=this.width<=760?0:-.34;projection[9]=this.width<=760?-.45:0;
    this.matrix=multiply(projection,lookAt(eye,target,[0,1,0]));this.eye=eye;
    gl.clearColor(...this.palette.fog,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
    gl.useProgram(this.main);this.bindMesh(this.worldBuffer);
    const u=this.uniforms,signal=frame.sample(8).point;
    gl.uniformMatrix4fv(u.Matrix,false,this.matrix);gl.uniformMatrix4fv(u.Model,false,identity());gl.uniform3fv(u.Eye,eye);gl.uniform3fv(u.Fog,this.palette.fog);gl.uniform1f(u.Time,frame.still?0:time*.001);gl.uniform1f(u.SignalZ,signal[2]);gl.uniform1f(u.SignalX,signal[0]);gl.uniform1f(u.Opacity,1);gl.uniform1f(u.Level,0);gl.uniform1f(u.Power,frame.power||0);
    gl.drawArrays(gl.TRIANGLES,0,this.worldCount);
    this.bindMesh(this.loopBuffer);
    for(const visit of frame.visits){
      if(length(sub(visit.origin.point,eye))>240)continue;
      const f=visit.origin.direction,sd=visit.side||1,r=[-f[2]*sd,0,f[0]*sd],p=visit.origin.point,k=visit.scale; // ▸DUAL mirrored for right-hand loops
      const model=new Float32Array([r[0]*k,0,r[2]*k,0,0,1,0,0,-f[0]*k,0,-f[2]*k,0,p[0],.025,p[2],1]);
      const opacity=visit.retiredAt!==undefined?(frame.still?0:clamp(1-(time-visit.retiredAt)/500,0,1)):(frame.still?1:clamp((time-visit.createdAt)/650,0,1));
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(opacity>.99);
      gl.uniform1f(u.Opacity,opacity);gl.uniform1f(u.Level,sd<0?1:0);gl.uniformMatrix4fv(u.Model,false,model);gl.drawArrays(gl.TRIANGLES,0,this.loopCount);gl.uniform1f(u.Level,0);
    }
    gl.depthMask(true);gl.disable(gl.BLEND);Object.values(this.attributes).forEach(loc=>gl.disableVertexAttribArray(loc));this.drawSparks(frame,time);
  }
  drawSparks(frame,time){
    const gl=this.gl,t=frame.still?0:time*.001,points=[];
    const push=(p,size,color)=>points.push(p[0],p[1]+.19,p[2],size,...color);
    push(frame.sample(8).point,1.6,[1,.77,.37]);push(frame.sample(8).point,.34,[1,.96,.8]);
    for(let i=1;i<18;i++)push(frame.sample(8-i*.27).point,.23*(1-i/20),[.95,.6,.25]);
    for(let i=0;i<42;i++){const pose=frame.sample((i*4.1+t*3)%110),lane=(i%3-1)*2.7;push(add(pose.point,[-pose.direction[2]*lane,0,pose.direction[0]*lane]),.34,[.3,.68,.69]);}
    gl.useProgram(this.sparks);gl.bindBuffer(gl.ARRAY_BUFFER,this.sparkBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.DYNAMIC_DRAW);
    const a=this.sparkAttributes;for(const [loc,size,offset] of [[a.position,3,0],[a.size,1,12],[a.color,3,16]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,28,offset);}
    gl.uniformMatrix4fv(this.sparkUniforms.matrix,false,this.matrix);gl.uniform1f(this.sparkUniforms.height,this.canvas.height);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,points.length/7);gl.depthMask(true);gl.disable(gl.BLEND);Object.values(a).forEach(loc=>gl.disableVertexAttribArray(loc));
  }
  project(point){if(!this.matrix)return null;const m=this.matrix,[x,y,z]=point,w=m[3]*x+m[7]*y+m[11]*z+m[15];if(w<=1)return null;return {x:((m[0]*x+m[4]*y+m[8]*z+m[12])/w*.5+.5)*this.width,y:(.5-(m[1]*x+m[5]*y+m[9]*z+m[13])/w*.5)*this.height,depth:w};}
}
function identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function add(a,b){return a.map((v,i)=>v+b[i]);}function sub(a,b){return a.map((v,i)=>v-b[i]);}function scale(a,s){return a.map(v=>v*s);}function length(a){return Math.hypot(...a);}function normalize(a){return scale(a,1/(length(a)||1));}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function dot(a,b){return a.reduce((s,v,i)=>s+v*b[i],0);}
function lookAt(eye,target,up){const z=normalize(sub(eye,target)),x=normalize(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),range=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(near+far)*range,-1,0,0,2*near*far*range,0]);}
function multiply(a,b){const out=new Float32Array(16);for(let column=0;column<4;column++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)out[column*4+row]+=a[k*4+row]*b[column*4+k];return out;}
