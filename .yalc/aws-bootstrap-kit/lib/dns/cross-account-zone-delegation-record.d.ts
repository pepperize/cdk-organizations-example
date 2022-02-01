import { Construct } from 'constructs';
export interface CrossAccountZoneDelegationRecordProps {
    targetAccount?: string;
    targetRoleToAssume?: string;
    targetHostedZoneId?: string;
    recordName: string;
    toDelegateNameServers: string[];
    currentAccountId: string;
}
/**
 * Create a NS zone delegation record in the target account
 */
export declare class CrossAccountZoneDelegationRecord extends Construct {
    constructor(scope: Construct, id: string, props: CrossAccountZoneDelegationRecordProps);
}
