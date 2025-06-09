import { create } from "zustand";

export const notificationStore = create((set) => ({
    notifications: [],
    lastNotificationId: null,
    
    addNotification: (notification) => set((state) => {
        // Check if this is a duplicate notification
        const isDuplicate = state.notifications.some(n => 
            n.id === notification.id || // Check by notification ID
            (n.type === notification.type && 
             n.details?.productId === notification.details?.productId &&
             !n.read) // Only consider unread notifications as duplicates
        );

        if (isDuplicate) {
            return state;
        }

        const newNotification = {
            id: notification.id || Date.now(), // Use provided ID or generate new one
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        return {
            notifications: [newNotification, ...state.notifications],
            lastNotificationId: newNotification.id
        };
    }),

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        )
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
        }))
    })),

    clearNotifications: () => set((state) => ({
        notifications: state.notifications.map(notification => ({
            ...notification,
            read: true,
            cleared: true
        }))
    })),

    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(notification => notification.id !== id)
    })),

    // Add method to handle real-time updates
    handleRealtimeUpdate: (data) => set((state) => {
        if (data.type === 'low_stock' || data.type === 'purchase_received') {
            const newNotification = {
                id: data.id || Date.now(), // Use provided ID or generate new one
                timestamp: new Date().toISOString(),
                read: false,
                ...data
            };

            // Check for duplicates before adding
            const isDuplicate = state.notifications.some(n => 
                n.id === newNotification.id || // Check by notification ID
                (n.type === data.type && 
                 n.details?.productId === data.details?.productId &&
                 !n.read) // Only consider unread notifications as duplicates
            );

            if (isDuplicate) {
                return state;
            }

            return {
                notifications: [newNotification, ...state.notifications],
                lastNotificationId: newNotification.id
            };
        }
        return state;
    })
})); 