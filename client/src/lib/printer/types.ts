export interface USBDevice {
  serialNumber: string;
  open(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

export interface UsbNavigator {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  propertyId: string;
  navigatorName: string;
  navigatorType: string;
  navigatorDescription: string;
  navigatorStatus: string;
  navigatorId: string;
  navigatorUniqueId: string;
  navigatorData: string;
  usb: {
    requestDevice(options: {
      filters: { vendorId: number }[];
    }): Promise<USBDevice>;
    getDevices(): Promise<USBDevice[]>;
  };
}
