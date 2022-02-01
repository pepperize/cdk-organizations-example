import { Construct } from 'constructs';
/**
 * This represents an Organization
 */
export declare class Organization extends Construct {
    /**
     * The Id of the Organization
     */
    readonly id: string;
    /**
     * The Id of the root Organizational Unit of the Organization
     */
    readonly rootId: string;
    constructor(scope: Construct, id: string);
    private enableAWSServiceAccess;
}
