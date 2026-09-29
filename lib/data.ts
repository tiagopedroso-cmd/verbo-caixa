export const movements=[
 {id:1,date:'29/09/2026 10:42',type:'Entrada',desc:'Oferta culto domingo',user:'João Silva',value:500},
 {id:2,date:'29/09/2026 09:15',type:'Saída',desc:'Material limpeza',user:'Maria Santos',value:120},
 {id:3,date:'28/09/2026 20:15',type:'Entrada',desc:'Oferta',user:'Pedro Oliveira',value:850},
 {id:4,date:'28/09/2026 18:10',type:'Saída',desc:'Água',user:'João Silva',value:150},
 {id:5,date:'27/09/2026 19:30',type:'Entrada',desc:'Dízimo',user:'Maria Santos',value:1200},
];
export const money=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
