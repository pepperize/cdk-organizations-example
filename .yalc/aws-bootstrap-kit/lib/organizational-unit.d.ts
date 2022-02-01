import { Construct } from 'constructs';
export interface OrganizationalUnitProps {
    Name: string;
    ParentId: string;
}
export declare class OrganizationalUnit extends Construct {
    readonly id: string;
    constructor(scope: Construct, id: string, props: OrganizationalUnitProps);
}
