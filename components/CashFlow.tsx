'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase-client';
import {money} from '@/lib/data';

type Row={tipo:'entrada'|'saida';valor:number;descricao?:string;data_movimentacao:string};

export default function CashFlow(){
  const[rows,setRows]=useState<Row[]>([]);
  const[period,setPeriod]=useState('30');
  const[start,setStart]=useState('');
  const[end,setEnd]=useState('');

  useEffect(()=>{(async()=>{
    const{data}=await createClient().from('movimentacoes').select('tipo,valor,descricao,data_movimentacao').eq('status','ativo').order('data_movimentacao');
    setRows((data||[]) as Row[]);
  })()},[]);

  const filtered=useMemo(()=>{
    if(period==='all')return rows;
    if(period==='custom'){
      return rows.filter(r=>{
        const d=new Date(r.data_movimentacao);
        const a=start?new Date(start+'T00:00:00'):null;
        const b=end?new Date(end+'T23:59:59'):null;
        return (!a||d>=a)&&(!b||d<=b);
      });
    }
    const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-Number(period)+1);
    return rows.filter(r=>new Date(r.data_movimentacao)>=d);
  },[rows,period,start,end]);

  const s=filtered.reduce((a,r)=>{r.tipo==='entrada'?a.e+=Number(r.valor):a.o+=Number(r.valor);return a},{e:0,o:0});
  const days=useMemo(()=>{const m=new Map<string,{e:number,o:number}>();filtered.forEach(r=>{const k=new Date(r.data_movimentacao).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});const v=m.get(k)||{e:0,o:0};r.tipo==='entrada'?v.e+=Number(r.valor):v.o+=Number(r.valor);m.set(k,v)});return [...m.entries()].slice(-12)},[filtered]);
  const max=Math.max(1,...days.flatMap(([,v])=>[v.e,v.o]));
  const dates=filtered.map(r=>new Date(r.data_movimentacao));

  function exportCsv(){
    const lines=[['Data','Tipo','Descrição','Valor'],...filtered.map(r=>[new Date(r.data_movimentacao).toLocaleString('pt-BR'),r.tipo==='entrada'?'Entrada':'Saída',r.descricao||'',Number(r.valor).toFixed(2).replace('.',',')])];
    const csv='\uFEFF'+lines.map(cols=>cols.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`fluxo-caixa-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);
  }

  return <>
    <div className="flowToolbar">
      <label>Período</label>
      <select value={period} onChange={e=>setPeriod(e.target.value)}>
        <option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="365">Últimos 12 meses</option><option value="custom">Período personalizado</option><option value="all">Todo o período</option>
      </select>
      {period==='custom'&&<div className="customDates"><input aria-label="Data inicial" type="date" value={start} onChange={e=>setStart(e.target.value)}/><span>até</span><input aria-label="Data final" type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div>}
      <button className="btn" onClick={exportCsv}>⇩ &nbsp; Exportar relatório</button>
    </div>
    <div className="grid3 flowStats"><div className="card statCard"><span className="bubble">↑</span><div><small>ENTRADAS</small><b className="greenText">{money(s.e)}</b><span>Total no período</span></div></div><div className="card statCard"><span className="bubble red">↓</span><div><small>SAÍDAS</small><b className="redText">{money(s.o)}</b><span>Total no período</span></div></div><div className="card statCard"><span className="bubble neutral">▣</span><div><small>RESULTADO</small><b>{money(s.e-s.o)}</b><span>Em espécie no caixa</span></div></div></div>
    <div className="flowGrid"><div className="card chartCard"><div className="sectionHead"><b>Entradas × Saídas por dia</b><span className="legend"><i className="dot in"/> Entradas <i className="dot out"/> Saídas</span></div><div className="liveChart large">{days.map(([d,v])=><div className="chartCol" key={d}><div className="bars"><i className="inBar" style={{height:`${Math.max(3,v.e/max*100)}%`}}/><i className="outBar" style={{height:`${Math.max(3,v.o/max*100)}%`}}/></div><small>{d}</small></div>)}</div></div><div className="card flowSummary"><h3>Resumo do período</h3><div><span>↑</span><label>Total de entradas</label><b className="greenText">{money(s.e)}</b></div><div><span>↓</span><label>Total de saídas</label><b className="redText">{money(s.o)}</b></div><div><span>=</span><label>Saldo final</label><b>{money(s.e-s.o)}</b></div><aside>▣ &nbsp; Período selecionado<br/><b>{dates.length?new Date(Math.min(...dates.map(d=>+d))).toLocaleDateString('pt-BR'):'—'} a {dates.length?new Date(Math.max(...dates.map(d=>+d))).toLocaleDateString('pt-BR'):'—'}</b></aside></div></div>
  </>;
}
