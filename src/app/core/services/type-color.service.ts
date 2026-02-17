import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TypeData {
  id: string;
  name: string;
  color: string;
  isCanonical: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TypeColorService {
  private types = signal<TypeData[]>([]);
  private typeColorMap = new Map<string, string>();
  
  constructor(private http: HttpClient) {
    this.loadTypes();
  }
  
  private loadTypes() {
    this.http.get<TypeData[]>('/dataset/data/types.json')
      .subscribe(types => {
        this.types.set(types);
        types.forEach(type => {
          this.typeColorMap.set(type.id, type.color);
        });
      });
  }
  
  getTypeColor(typeName: string): string {
    return this.typeColorMap.get(typeName.toLowerCase()) || '#777777';
  }
  
  getAllTypes(): TypeData[] {
    return this.types();
  }
}
