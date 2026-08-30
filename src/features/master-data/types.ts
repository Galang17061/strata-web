export type Vendor = {
  vendorId: string;
  manufacturerName: string;
  logoImage: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type VendorInput = {
  manufacturerName: string;
  validUntil?: string | null;
  logo?: File | null;
};

export type MasterComponentInput = {
  componentName: string;
  vendorId: string;
  serialNumber: string | null;
  failureRate: number;
  cost: string | null;
  compatibility: string | null;
};

export type MasterComponent = {
  componentId: string;
  componentName: string;
  vendorId: string;
  manufacturerName: string;
  cost: string | null;
  compatibility: string | null;
  failureRate: number | null;
  serialNumber: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};
