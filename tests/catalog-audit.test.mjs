import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditCatalog} from '../scripts/audit-catalog.mjs';
test('audit distinguishes canonical, quarantined, conflicting and incomplete records without mutating input',()=>{
  const recipe={mdb:'MDB-0001',title:'Soep',ingredients:'1 ui',steps:'Kook de ui',sourceURL:'https://example.org/soep',notionURL:'https://notion.so/a'};
  const rows=[{mdb:'MDB-0001',recipe},{mdb:'MDB-0002',recipe:{...recipe,mdb:'MDB-0002',sourceURL:'https://www.example.org/soep/?utm_source=ig'}},
    {mdb:'MDB-0003',recipe:{...recipe,mdb:'MDB-0003',syncStatus:'duplicate-quarantined'}},
    {mdb:'MDB-0002',recipe:{title:'Onvolledig'}},{mdb:'invalid',recipe:{...recipe,mdb:'MDB-0009'}}];
  const snapshot=JSON.stringify(rows),r=auditCatalog(rows);
  assert.equal(r.totalRows,5);assert.equal(r.canonicalRecipes,4);assert.equal(r.quarantined,1);
  assert.deepEqual(r.conflictingMDB,['MDB-0002']);assert.deepEqual(r.invalidMDB,['invalid']);
  assert.equal(r.identityMismatches.length,1);assert.deepEqual(r.incomplete,['MDB-0002']);
  assert.equal(r.sameSource.length,2);assert.equal(r.sameContent.length,2);assert.equal(r.highestMDB,'MDB-0003');
  assert.equal(JSON.stringify(rows),snapshot);
});
