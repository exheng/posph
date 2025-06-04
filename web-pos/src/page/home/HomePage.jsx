import React, { useEffect, useState } from "react";
import { request } from "../../util/helper";
import Item from "antd/es/list/Item";
import HomeGrid from "../../component/home/HomeGrid";
import HomeSaleChart from "../../component/home/HomeSaleChart";
import HomePurchaseChart from "../../component/home/HomePurchaseChart";
import { create } from 'zustand'

const countStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))

function HomePage() {
 const [home,setHome] = useState([])

 useEffect(()=>{
  getList();
 }, []);

  const getList = async () => {
   const res = await request("home", "get");
   if(res) {
    setHome(res.list);
   }
  };
  return(
  <div>
   
      <HomeGrid data={home}/>
      <HomeSaleChart/>
      <HomePurchaseChart/>
    
  </div> 
  );
}
export default HomePage;
