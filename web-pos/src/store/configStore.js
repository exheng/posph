import { create } from "zustand";

export const configStore = create((set) => ({

    config : {
        category : null,
        role :null,
        supplier: null,
        purchase_status:null,
    },
    setConfig : (params) => set ((state) =>({
        config:params,
        // ...state.config,
        // ...params
    })),
    // descrease: () =>
    //     set((state)=>({
    //         count : state.count - 1,
    //     }))
        
}))
