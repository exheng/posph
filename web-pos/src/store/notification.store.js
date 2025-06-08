import { create } from "zustand";

export const notificationStore = create((set) => ({
    notifications: [],
    addNotification: (notification) => set((state) => ({
        notifications: [{
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        }, ...state.notifications]
    })),
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
    }))
})); 