export enum OrderEvent{
    CREATE_ORDER = "create_order",
    CANCLE_ORDER = "cancel_order"
}

export type TOPIC_TYPE = "OrderEvents"

export interface MessageType {
    headers? : Record<string, any>;
    event: OrderEvent;
    data: Record<string, any>;    
}

