
export class Repository<T> {
    private container: Array<T>;

    public constructor() {
        this.container = [];
    }

    public set(container: Array<T>) {
        this.container = container;
    }

    public getAll(): Array<T> {
        return this.container;
    }
}
