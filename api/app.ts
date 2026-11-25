import kitchenHandler from '../lib/kitchen-api.js';
import ahHandler from '../lib/ah-import.js';
import shareHandler from '../lib/shared-recipe.js';
export default function handler(_req:any,res:any){
 if(_req.query?.kitchen)return kitchenHandler(_req,res);
 if(_req.query?.ah)return ahHandler(_req,res);
 if(_req.query?.share==='1')return shareHandler(_req,res);
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 res.setHeader('Location','/index.html');
 return res.status(307).end();
}
