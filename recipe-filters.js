globalThis.MBDRecipeFilters={
 matches(recipe,filters,allRatings){
  if(filters.category&&![recipe.category,...(recipe.collections||[])].includes(filters.category))return false;
  const ratings=allRatings[recipe.mdb||recipe.id]||{};
  return filters.people.every(person=>{
   const rating=person==='Dian'?(ratings.Dian||ratings.Mama):person.startsWith('Gast:')?
    (ratings.Gast?.name===person.slice(5)?ratings.Gast:null):ratings[person];
   const stars=rating?.stars;
   if(typeof stars!=='number'||stars<1||stars>5)return false;
   return filters.mode==='exact'?stars===filters.stars:stars>=filters.stars;
  });
 }
};
