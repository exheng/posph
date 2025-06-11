import { create } from "zustand";
import { request } from "../util/helper"; // Assuming request is accessible here

export const configStore = create((set) => ({
    config: {
        store: {
            name: '',
            phone: '',
            address: '',
            email: '',
            website: '',
            currency: 'USD',
            tax_rate: 0,
            logo: '',
        },
        system: {
            language: 'en',
            timezone: 'UTC',
            date_format: 'YYYY-MM-DD',
            time_format: '24h',
        },
        appearance: {
            theme: 'light',
            primary_color: '#1890ff',
            secondary_color: '#52c41a',
        },
        category: null,
        role: null,
        supplier: null,
        purchase_status: null,
        brand: null,
    },
    setConfig: (params) => set((state) => ({
        config: { ...state.config, ...params },
    })),
    refreshConfig: async () => {
        try {
            const response = await request('config', 'get');
            if (response && !response.error) {
                set((state) => ({
                    config: { ...state.config, ...response },
                }));
                // Dispatch a custom event to notify other components, if needed
                const event = new Event('configUpdated');
                window.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Error refreshing config:', error);
        }
    },
}));
