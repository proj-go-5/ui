import Route from '@ember/routing/route';

export default class CatalogRoute extends Route {
    async model() {
        let response = await fetch('/api/products.json');
        let parsed = await response.json();
        return parsed["page"];
    }
}

