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
