export default class Broadcaster {
    private subscriptions: { [key: string]: Function[] } = {};

    public publish(messageName: string, ...data: any) {
        const functions: Function[] = this.subscriptions[messageName];
        if(!functions) throw new Error("no subscriptions for message: " + messageName);
        for(let i = 0; i<functions.length; i++) {
            functions[i](...data);
        }
    }

    public subscribe(messageName: string, f: Function) {
        if(!this.subscriptions[messageName]) {
            this.subscriptions[messageName] = [f];
        }else {
            this.subscriptions[messageName].push(f);
        }
    }

    public subscribeUnique(messageName: string, f: Function) {
        this.subscriptions[messageName] = [f];
    }

    public unsubscribe(messageName: string, f: Function) {
        const index = this.subscriptions[messageName].indexOf(f);
        if(index === -1) throw new Error("function not found in list of subscriptions");
        this.subscriptions[messageName].splice(index, 1);
    }
}