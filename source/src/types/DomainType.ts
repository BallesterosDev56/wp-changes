export type DomainDNSConfig = {
  hostname: string;
  type: string;
  value: string;
};

export type InboundRoutingConfig = DomainDNSConfig & {
  priority: string;
};

export type DomainConfig = {
  spf: DomainDNSConfig;
  dkim: DomainDNSConfig;
  returnPath: DomainDNSConfig;
  customTracking: DomainDNSConfig;
  inboundRouting: InboundRoutingConfig;
};

export type IDomainConfig = DomainConfig;

export type IDomain = {
  id: string;
  name: string;
  isVerified: boolean;
  domainConfigId: string;
  domainConfig: IDomainConfig;
};

export type IVerifyDomain = {
  spf: boolean;
  dkim: boolean;
  returnPath: boolean;
  customTracking: boolean;
};
