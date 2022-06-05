export interface Bindings {
    USERNAME: string
    PASSWORD: string
    VENTRATA: KVNamespace
  }
  
  declare global {
    function getMiniflareBindings(): Bindings
  }