import { api, queryString, type Envelope } from "@/lib/api/client";
import type { MasterComponent, Vendor } from "@/features/master-data/types";
import type { ListParams } from "@/features/projects/types";

export function listMasterComponents(params: ListParams = {}): Promise<Envelope<MasterComponent[]>> {
  return api.get<Envelope<MasterComponent[]>>(`/MasterComponent${queryString(params)}`);
}

export function listVendors(params: ListParams = {}): Promise<Envelope<Vendor[]>> {
  return api.get<Envelope<Vendor[]>>(`/MasterManufacturer${queryString(params)}`);
}
