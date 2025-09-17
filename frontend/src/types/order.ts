// src/types/order.ts
import type { ServiceSlug } from './service';

export type OrderPayload = {
  first_name: string;
  last_name:  string;
  email:      string;
  phone:      string;
  message?:   string;
  // ✅ строго типизируем
  service_type?: ServiceSlug;
};
