import { create } from 'zustand'
import { Customer, CustomerProgress } from '@/types'

interface CustomerState {
  customers: Customer[]
  selectedCustomer: Customer | null
  progress: Record<string, CustomerProgress[]>
  setCustomers: (customers: Customer[]) => void
  setSelectedCustomer: (customer: Customer | null) => void
  setProgress: (customerId: string, progress: CustomerProgress[]) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  selectedCustomer: null,
  progress: {},
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setProgress: (customerId, progress) =>
    set((state) => ({ progress: { ...state.progress, [customerId]: progress } })),
  updateCustomer: (id, data) =>
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
}))
