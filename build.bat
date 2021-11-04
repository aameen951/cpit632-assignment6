
docker build -t aameen951/cpit-632-asgn6-web-img web
docker build -t aameen951/cpit-632-asgn6-best-selling-img best-selling
docker build -t aameen951/cpit-632-asgn6-ordering-img ordering
docker build -t aameen951/cpit-632-asgn6-product-img product

docker push aameen951/cpit-632-asgn6-web-img
docker push aameen951/cpit-632-asgn6-best-selling-img
docker push aameen951/cpit-632-asgn6-ordering-img
docker push aameen951/cpit-632-asgn6-product-img
