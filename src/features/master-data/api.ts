import { api, queryString, type Envelope } from "@/lib/api/client";
import type { MasterComponent, Vendor, VendorInput } from "@/features/master-data/types";
import type { ListParams } from "@/features/projects/types";

export function listMasterComponents(params: ListParams = {}): Promise<Envelope<MasterComponent[]>> {
  return api.get<Envelope<MasterComponent[]>>(`/MasterComponent${queryString(params)}`);
}

export function listVendors(params: ListParams = {}): Promise<Envelope<Vendor[]>> {
  return api.get<Envelope<Vendor[]>>(`/MasterManufacturer${queryString(params)}`);
}

function vendorForm(input: VendorInput): FormData {
  const form = new FormData();
  form.append("ManufacturerName", input.manufacturerName);
  if (input.validUntil) form.append("ValidUntil", input.validUntil);
  if (input.logo) form.append("LogoImage", input.logo, input.logo.name);
  return form;
}

export function createVendor(input: VendorInput): Promise<Envelope<unknown>> {
  return api.post<Envelope<unknown>>("/MasterManufacturer", vendorForm(input));
}
