/* Pure planning helpers. Recipe source fields are never mutated. */
(()=>{
const norm=s=>String(s||'').toLocaleLowerCase('nl').normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const themes=[['soep','Soep',/soep|soup|bouillon/i],['wraps','Wraps / taco’s',/wrap|taco|burrito|tortilla/i],['snel','Rijst / aardappel / restjes',/rijst|aardappel|restjes|stamppot/i],['oven','Oven',/oven|traybake|schotel/i],['all','Alle collecties',null]];
function basePeople(value){const s=String(value||'').trim();const m=s.match(/^(?:voor\s+)?(\d+(?:[.,]\d+)?)\s*(?:personen?|pers\.?|porties?|servings?)?$/i);return m&&Number(m[1].replace(',','.'))>0?Number(m[1].replace(',','.')):null}
function category(r,c){if(!c||c==='all')return true;if(c.startsWith('collection:')){const name=c.slice(11);return (r.collections||[]).includes(name)||(name==='HelloFresh'&&/hello\s*-?\s*fresh/i.test([r.book,r.sourceAuthor,r.sourceNotes].join(' ')))||(name==='Uit kookboeken'&&r.sourceKind==='Kookboek')}
return themes.find(x=>x[0]===c)?.[2]?.test([r.title,r.category,r.method,(r.collections||[]).join(' ')].join(' '))||false}
function rating(r,ratings,person,filter){const n=Number(ratings[r.mdb||r.id]?.[person]?.stars)||0;return filter==='all'||filter==='4plus'&&n>=4||filter==='5'&&n===5||filter==='unrated'&&n===0}
const fractions={'¼':.25,'½':.5,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125};
function amount(s){if(fractions[s])return fractions[s];let m=s.match(/^(\d+)\s+(\d+)\/(\d+)$/);if(m)return +m[1]+ +m[2]/+m[3];m=s.match(/^(\d+)\/(\d+)$/);if(m)return +m[1]/+m[2];m=s.match(/^(\d+)([¼½¾⅓⅔⅛])$/);return m?+m[1]+fractions[m[2]]:Number(s.replace(',','.'))}
function scale(line,factor){const s=String(line||'').trim();if(!Number.isFinite(factor)||factor===1)return s;const m=s.match(/^([•*–-]?\s*)((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+[¼½¾⅓⅔⅛])|(?:\d+(?:[.,]\d+)?)|[¼½¾⅓⅔⅛])(\s*)(.+)$/);if(!m||/^[-–/\d.,]/.test(m[4]))return s;const n=amount(m[2]);return Number.isFinite(n)?m[1]+String(Math.round(n*factor*100)/100).replace('.',',')+(m[3]||' ')+m[4]:s}
globalThis.MBDWeekCore={norm,themes,basePeople,category,rating,scale};
})();
