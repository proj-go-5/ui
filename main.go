package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

func main() {
	port, ok := os.LookupEnv("GW_PORT")
	if !ok {
		port = "8081"
	}

	log.Printf("Running the server on port %s\n", port)

	router := http.NewServeMux()

	fs := http.FileServer(http.Dir("./static/web"))
	router.Handle("/ui/", http.StripPrefix("/ui/", fs))

	// Proxies
	productsServer, ok := os.LookupEnv("GW_PRODUCTS_SERVER_ADDR")
	if !ok {
		productsServer = "http://localhost:8000"
	}
	productsURL, err := url.Parse(productsServer)
	if err != nil {
		log.Fatalf("failed to parse URL for products: %s", err)
	}
	router.Handle("/products", proxyRoute(productsURL))

	ordersServer, ok := os.LookupEnv("GW_ORDERS_SERVER_ADDR")
	if !ok {
		ordersServer = "http://localhost:8089"
	}
	ordersURL, err := url.Parse(ordersServer)
	if err != nil {
		log.Fatalf("failed to parse URL for orders: %s", err)
	}
	router.Handle("/orders", proxyRoute(ordersURL))

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

func proxyRoute(target *url.URL) *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host
			req.URL.Path = singleJoiningSlash(target.Path, req.URL.Path)
			if target.RawQuery == "" || req.URL.RawQuery == "" {
				req.URL.RawQuery = target.RawQuery + req.URL.RawQuery
			} else {
				req.URL.RawQuery = target.RawQuery + "&" + req.URL.RawQuery
			}
		},
	}
}

func singleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}
