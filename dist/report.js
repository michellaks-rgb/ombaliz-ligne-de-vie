/* Creates the report entirely in the browser. */
function exportLifeReport({birth,birthYear,email,phone,events,prompts,importance,kindNames}, save=true){
 const doc=new jspdf.jsPDF({compress:true});
 const navy='#164b54', muted='#526568';
 const colors={'1':'#297554','0':'#6b6251','-1':'#9d3953'};
 let y;
 function page(){
  if(y!==undefined)doc.addPage();
  doc.setFillColor(navy).rect(0,0,210,22,'F');
  doc.setTextColor('#ffffff').setFont('helvetica','bold').setFontSize(11).text('OMBALIZ THÉRAPIE  /  MA LIGNE DE VIE',16,14);
  y=33;
 }
 function space(height){if(y+height>276)page()}
 function write(value,{size=11,bold=false,color=navy,indent=0}={}){
  doc.setFont('helvetica',bold?'bold':'normal').setFontSize(size);
  const lines=doc.splitTextToSize(String(value),178-indent);
  for(const line of lines){
   space(6);
   doc.setFont('helvetica',bold?'bold':'normal').setFontSize(size).setTextColor(color);
   doc.text(line,16+indent,y);
   y+=size*.47;
  }
 }
 const resources=e=>Object.values(e.resources??{}).flat().filter(r=>r.text.trim());
 page();
 write('Bilan personnel',{size:25,bold:true});
 y+=3;
 write('Date de naissance : '+birth);
 if(email)write('E-mail : '+email);
 if(phone)write('Téléphone : '+phone);
 y+=6;
 write('Ma ligne de vie',{size:17,bold:true});
 write('Vert : heureux   |   Bordeaux : difficile   |   Brun : mitigé',{size:10,color:muted});
 const points=[{title:'Naissance',year:birthYear,kind:0,level:0},...events];
 const segmentSize=5;
 for(let i=0;i<points.length;i+=segmentSize){
  space(59);
  const chunk=points.slice(i,i+segmentSize);
  const base=y+20;
  doc.setFillColor('#f5f6f1').roundedRect(16,y+2,178,49,3,3,'F');
  doc.setDrawColor('#aebdb7').setLineWidth(.25).line(21,base,189,base);
  const nodes=chunk.map((e,j)=>({e,x:32+j*36,y:base-e.kind*e.level*4}));
  for(let j=1;j<nodes.length;j++){
   const a=nodes[j-1],b=nodes[j],dx=(b.x-a.x)/2,dy=b.y-a.y;
   doc.setDrawColor(navy).setLineWidth(.65).lines([[dx,0,dx,dy,dx*2,dy]],a.x,a.y);
  }
  for(const {e,x,y:py} of nodes){
   doc.setFillColor(colors[e.kind]).circle(x,py,1.65,'F');
   doc.setTextColor(muted).setFont('helvetica','bold').setFontSize(9).text(String(e.year),x,base+19,{align:'center'});
   const title=Array.from(e.title);
   const label=title.length>17?title.slice(0,16).join('')+'…':e.title;
   doc.setFont('helvetica','normal').setFontSize(8).text(label,x,base+25,{align:'center'});
  }
  y+=58;
 }
 const starred=events.flatMap(e=>resources(e).filter(r=>r.star).map(r=>({r,e})));
 if(starred.length){
  space(20);
  write('Mes ressources pour la suite',{size:17,bold:true});
  for(const {r,e} of starred)write(r.text+' ('+e.year+' · '+e.title+')',{indent:3});
  y+=7;
 }
 space(22);
 write('Mes événements en détail',{size:17,bold:true});
 for(const e of events){
  y+=5;
  space(23);
  write(e.year+' · '+e.title,{size:14,bold:true,color:colors[e.kind]});
  write(kindNames[e.kind]+'  |  À quel point cet événement m’a marqué : '+['','Un peu','Assez','Beaucoup'][e.level],{size:10,color:muted});
  if(e.note)write(e.note);
  for(const [key,label] of prompts){
   if(key==='next'){
    if(e.next?.trim()){space(14);write(label,{bold:true});write(e.next,{indent:3})}
    continue;
   }
   const rows=(e.resources?.[key]??[]).filter(r=>r.text.trim());
   if(!rows.length)continue;
   space(14);
   write(label,{bold:true});
   for(const r of rows)write((r.star?'Prioritaire · ':'')+r.text+(r.importance?' — aide ressentie : '+importance[r.importance]:''),{indent:3});
  }
 }
 const total=doc.getNumberOfPages();
 for(let n=1;n<=total;n++){
  doc.setPage(n).setDrawColor('#b9c7bf').setLineWidth(.25).line(16,282,194,282);
  doc.setTextColor(muted).setFont('helvetica','normal').setFontSize(9);
  doc.text('Bilan personnel · Ombaliz Thérapie',16,288);
  doc.text(n+' / '+total,194,288,{align:'right'});
 }
 if(save)doc.save('Ma-ligne-de-vie-Ombaliz.pdf');
 return doc;
}
