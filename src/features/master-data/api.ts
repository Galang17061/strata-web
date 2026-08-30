import { api, queryString, type DownloadedFile, type Envelope } from "@/lib/api/client";
import type { ImportResult, MasterComponent, MasterComponentInput, Vendor, VendorInput } from "@/features/master-data/types";
import type { ListParams } from "@/features/projects/types";

export function listMasterComponents(params: ListParams = {}): Promise<Envelope<MasterComponent[]>> {
  return api.get<Envelope<MasterComponent[]>>(`/MasterComponent${queryString(params)}`);
}

export function createMasterComponent(input: MasterComponentInput): Promise<Envelope<unknown>> {
  return api.post<Envelope<unknown>>("/MasterComponent", input);
}

export function updateMasterComponent(componentId: string, input: MasterComponentInput): Promise<Envelope<unknown>> {
  return api.put<Envelope<unknown>>(`/MasterComponent/${encodeURIComponent(componentId)}`, input);
}

export function importComponents(file: File): Promise<Envelope<ImportResult>> {
  const form = new FormData();
  form.append("file", file, file.name);
  return api.post<Envelope<ImportResult>>("/MasterComponent/import", form);
}

export function downloadComponentTemplate(): Promise<DownloadedFile> {
  return api.download("/MasterComponent/template", "component-template.xlsx");
}

export function exportComponents(): Promise<DownloadedFile> {
  return api.download("/MasterComponent/export", "components.xlsx");
}

export function deleteMasterComponent(componentId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/MasterComponent/${encodeURIComponent(componentId)}`, { silent: true });
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

export function updateVendor(vendorId: string, input: VendorInput): Promise<Envelope<unknown>> {
  return api.put<Envelope<unknown>>(`/MasterManufacturer/${encodeURIComponent(vendorId)}`, vendorForm(input));
}

export function deleteVendor(vendorId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/MasterManufacturer/${encodeURIComponent(vendorId)}`, { silent: true });
}
