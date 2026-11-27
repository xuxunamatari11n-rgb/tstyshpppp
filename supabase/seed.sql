-- Demonstration inventory. Generated with node scripts/generate-shop-seed.mjs.

begin;

insert into public.categories(stable_key, slug, parent_id, image_path, is_visible, is_featured, sort_order) values
  ('fashion', 'mode-accessoires', null, '/images/home/category-fashion.webp', true, true, 0),
  ('electronics', 'electronique', null, '/images/home/category-electronics.webp', true, true, 1),
  ('home', 'maison-decoration', null, '/images/home/category-home.webp', true, true, 2),
  ('beauty', 'beaute-bien-etre', null, '/images/home/category-beauty.webp', true, true, 3),
  ('sport', 'sport-loisirs', null, '/images/home/category-sport.webp', true, true, 4),
  ('children', 'enfants-jouets', null, '/images/home/category-children.webp', true, true, 5),
  ('office', 'bureau-papeterie', null, null, true, false, 6),
  ('other', 'autres-produits', null, null, true, false, 7)
on conflict (stable_key) do nothing;

insert into public.categories(stable_key, slug, parent_id, image_path, is_visible, is_featured, sort_order) values
  ('clothing', 'mode-accessoires-clothing', (select id from public.categories where stable_key = 'fashion'), null, true, false, 0),
  ('shoes', 'mode-accessoires-shoes', (select id from public.categories where stable_key = 'fashion'), null, true, false, 1),
  ('bags', 'mode-accessoires-bags', (select id from public.categories where stable_key = 'fashion'), null, true, false, 2),
  ('phones', 'electronique-phones', (select id from public.categories where stable_key = 'electronics'), null, true, false, 0),
  ('audio', 'electronique-audio', (select id from public.categories where stable_key = 'electronics'), null, true, false, 1),
  ('computing', 'electronique-computing', (select id from public.categories where stable_key = 'electronics'), null, true, false, 2),
  ('decor', 'maison-decoration-decor', (select id from public.categories where stable_key = 'home'), null, true, false, 0),
  ('lighting', 'maison-decoration-lighting', (select id from public.categories where stable_key = 'home'), null, true, false, 1),
  ('kitchen', 'maison-decoration-kitchen', (select id from public.categories where stable_key = 'home'), null, true, false, 2),
  ('skincare', 'beaute-bien-etre-skincare', (select id from public.categories where stable_key = 'beauty'), null, true, false, 0),
  ('haircare', 'beaute-bien-etre-haircare', (select id from public.categories where stable_key = 'beauty'), null, true, false, 1),
  ('wellness', 'beaute-bien-etre-wellness', (select id from public.categories where stable_key = 'beauty'), null, true, false, 2),
  ('fitness', 'sport-loisirs-fitness', (select id from public.categories where stable_key = 'sport'), null, true, false, 0),
  ('outdoors', 'sport-loisirs-outdoors', (select id from public.categories where stable_key = 'sport'), null, true, false, 1),
  ('games', 'sport-loisirs-games', (select id from public.categories where stable_key = 'sport'), null, true, false, 2),
  ('toys', 'enfants-jouets-toys', (select id from public.categories where stable_key = 'children'), null, true, false, 0),
  ('creative', 'enfants-jouets-creative', (select id from public.categories where stable_key = 'children'), null, true, false, 1),
  ('baby', 'enfants-jouets-baby', (select id from public.categories where stable_key = 'children'), null, true, false, 2),
  ('stationery', 'bureau-papeterie-stationery', (select id from public.categories where stable_key = 'office'), null, true, false, 0),
  ('organization', 'bureau-papeterie-organization', (select id from public.categories where stable_key = 'office'), null, true, false, 1),
  ('officeAccessories', 'bureau-papeterie-office-accessories', (select id from public.categories where stable_key = 'office'), null, true, false, 2),
  ('daily', 'autres-produits-daily', (select id from public.categories where stable_key = 'other'), null, true, false, 0),
  ('gifts', 'autres-produits-gifts', (select id from public.categories where stable_key = 'other'), null, true, false, 1),
  ('travel', 'autres-produits-travel', (select id from public.categories where stable_key = 'other'), null, true, false, 2)
on conflict (stable_key) do nothing;

insert into public.category_translations(category_id, locale, name, image_alt) values
  ((select id from public.categories where stable_key = 'fashion'), 'fr', 'Mode et accessoires', 'Casquette corail et sac beige'),
  ((select id from public.categories where stable_key = 'fashion'), 'es', 'Moda y accesorios', 'Gorra coral y bolso beige'),
  ((select id from public.categories where stable_key = 'electronics'), 'fr', 'Électronique', 'Écouteurs sans fil et enceinte noire'),
  ((select id from public.categories where stable_key = 'electronics'), 'es', 'Electrónica', 'Auriculares inalámbricos y altavoz negro'),
  ((select id from public.categories where stable_key = 'home'), 'fr', 'Maison et décoration', 'Lampe dôme verte et vide-poche'),
  ((select id from public.categories where stable_key = 'home'), 'es', 'Hogar y decoración', 'Lámpara de cúpula verde y bandeja'),
  ((select id from public.categories where stable_key = 'beauty'), 'fr', 'Beauté et bien-être', 'Flacons de soin et pot de crème'),
  ((select id from public.categories where stable_key = 'beauty'), 'es', 'Belleza y bienestar', 'Frascos de cuidado y tarro de crema'),
  ((select id from public.categories where stable_key = 'sport'), 'fr', 'Sport et loisirs', 'Haltères bleus et gourde grise'),
  ((select id from public.categories where stable_key = 'sport'), 'es', 'Deporte y ocio', 'Mancuernas azules y botella gris'),
  ((select id from public.categories where stable_key = 'children'), 'fr', 'Enfants et jouets', 'Anneaux colorés et cubes en bois'),
  ((select id from public.categories where stable_key = 'children'), 'es', 'Infantil y juguetes', 'Anillos de colores y bloques de madera'),
  ((select id from public.categories where stable_key = 'office'), 'fr', 'Bureau et papeterie', null),
  ((select id from public.categories where stable_key = 'office'), 'es', 'Oficina y papelería', null),
  ((select id from public.categories where stable_key = 'other'), 'fr', 'Autres produits', null),
  ((select id from public.categories where stable_key = 'other'), 'es', 'Otros productos', null),
  ((select id from public.categories where stable_key = 'clothing'), 'fr', 'Vêtements', null),
  ((select id from public.categories where stable_key = 'clothing'), 'es', 'Ropa', null),
  ((select id from public.categories where stable_key = 'shoes'), 'fr', 'Chaussures', null),
  ((select id from public.categories where stable_key = 'shoes'), 'es', 'Calzado', null),
  ((select id from public.categories where stable_key = 'bags'), 'fr', 'Sacs et accessoires', null),
  ((select id from public.categories where stable_key = 'bags'), 'es', 'Bolsos y accesorios', null),
  ((select id from public.categories where stable_key = 'phones'), 'fr', 'Téléphones', null),
  ((select id from public.categories where stable_key = 'phones'), 'es', 'Teléfonos', null),
  ((select id from public.categories where stable_key = 'audio'), 'fr', 'Audio', null),
  ((select id from public.categories where stable_key = 'audio'), 'es', 'Audio', null),
  ((select id from public.categories where stable_key = 'computing'), 'fr', 'Informatique', null),
  ((select id from public.categories where stable_key = 'computing'), 'es', 'Informática', null),
  ((select id from public.categories where stable_key = 'decor'), 'fr', 'Décoration', null),
  ((select id from public.categories where stable_key = 'decor'), 'es', 'Decoración', null),
  ((select id from public.categories where stable_key = 'lighting'), 'fr', 'Éclairage', null),
  ((select id from public.categories where stable_key = 'lighting'), 'es', 'Iluminación', null),
  ((select id from public.categories where stable_key = 'kitchen'), 'fr', 'Cuisine', null),
  ((select id from public.categories where stable_key = 'kitchen'), 'es', 'Cocina', null),
  ((select id from public.categories where stable_key = 'skincare'), 'fr', 'Soins de la peau', null),
  ((select id from public.categories where stable_key = 'skincare'), 'es', 'Cuidado de la piel', null),
  ((select id from public.categories where stable_key = 'haircare'), 'fr', 'Soins des cheveux', null),
  ((select id from public.categories where stable_key = 'haircare'), 'es', 'Cuidado del cabello', null),
  ((select id from public.categories where stable_key = 'wellness'), 'fr', 'Bien-être', null),
  ((select id from public.categories where stable_key = 'wellness'), 'es', 'Bienestar', null),
  ((select id from public.categories where stable_key = 'fitness'), 'fr', 'Fitness', null),
  ((select id from public.categories where stable_key = 'fitness'), 'es', 'Fitness', null),
  ((select id from public.categories where stable_key = 'outdoors'), 'fr', 'Plein air', null),
  ((select id from public.categories where stable_key = 'outdoors'), 'es', 'Aire libre', null),
  ((select id from public.categories where stable_key = 'games'), 'fr', 'Jeux et loisirs', null),
  ((select id from public.categories where stable_key = 'games'), 'es', 'Juegos y pasatiempos', null),
  ((select id from public.categories where stable_key = 'toys'), 'fr', 'Jouets', null),
  ((select id from public.categories where stable_key = 'toys'), 'es', 'Juguetes', null),
  ((select id from public.categories where stable_key = 'creative'), 'fr', 'Loisirs créatifs', null),
  ((select id from public.categories where stable_key = 'creative'), 'es', 'Manualidades', null),
  ((select id from public.categories where stable_key = 'baby'), 'fr', 'Univers bébé', null),
  ((select id from public.categories where stable_key = 'baby'), 'es', 'Productos para bebés', null),
  ((select id from public.categories where stable_key = 'stationery'), 'fr', 'Papeterie', null),
  ((select id from public.categories where stable_key = 'stationery'), 'es', 'Papelería', null),
  ((select id from public.categories where stable_key = 'organization'), 'fr', 'Rangement', null),
  ((select id from public.categories where stable_key = 'organization'), 'es', 'Organización', null),
  ((select id from public.categories where stable_key = 'officeAccessories'), 'fr', 'Accessoires de bureau', null),
  ((select id from public.categories where stable_key = 'officeAccessories'), 'es', 'Accesorios de oficina', null),
  ((select id from public.categories where stable_key = 'daily'), 'fr', 'Essentiels du quotidien', null),
  ((select id from public.categories where stable_key = 'daily'), 'es', 'Básicos del día a día', null),
  ((select id from public.categories where stable_key = 'gifts'), 'fr', 'Idées cadeaux', null),
  ((select id from public.categories where stable_key = 'gifts'), 'es', 'Ideas para regalar', null),
  ((select id from public.categories where stable_key = 'travel'), 'fr', 'Accessoires de voyage', null),
  ((select id from public.categories where stable_key = 'travel'), 'es', 'Accesorios de viaje', null)
on conflict (category_id, locale) do nothing;

insert into public.products(category_id, slug, price, comparison_price, is_available, is_visible, is_featured, is_new_arrival, bestseller_rank, published_at, created_at, sort_order) values
  ((select id from public.categories where stable_key = 'shoes'), 'stride-sneaker', 22500, 30000, true, true, true, false, null, '2026-10-08T00:00:00Z', '2026-10-08T00:00:00Z', 0),
  ((select id from public.categories where stable_key = 'audio'), 'pulse-headphones', 15000, 20000, true, true, true, false, 1, '2026-10-12T00:00:00Z', '2026-10-12T00:00:00Z', 1),
  ((select id from public.categories where stable_key = 'lighting'), 'desk-lamp', 12500, 16000, true, true, false, true, null, '2026-11-13T00:00:00Z', '2026-11-13T00:00:00Z', 2),
  ((select id from public.categories where stable_key = 'skincare'), 'studio-care', 7500, 10000, true, true, false, false, null, '2026-10-21T00:00:00Z', '2026-10-21T00:00:00Z', 3),
  ((select id from public.categories where stable_key = 'bags'), 'everyday-bag', 11000, null, true, true, true, true, 2, '2026-11-24T00:00:00Z', '2026-11-24T00:00:00Z', 4),
  ((select id from public.categories where stable_key = 'fitness'), 'training-kit', 14000, null, true, true, false, true, null, '2026-11-22T00:00:00Z', '2026-11-22T00:00:00Z', 5),
  ((select id from public.categories where stable_key = 'toys'), 'stacking-rings', 6500, null, true, true, true, true, 4, '2026-11-18T00:00:00Z', '2026-11-18T00:00:00Z', 6),
  ((select id from public.categories where stable_key = 'audio'), 'pocket-speaker', 18500, null, true, true, true, false, 3, '2026-10-29T00:00:00Z', '2026-10-29T00:00:00Z', 7)
on conflict (slug) do nothing;

insert into public.product_translations(product_id, locale, name, short_description) values
  ((select id from public.products where slug = 'stride-sneaker'), 'fr', 'Baskets Stride', 'Des baskets claires à semelle corail pour le quotidien.'),
  ((select id from public.products where slug = 'stride-sneaker'), 'es', 'Zapatillas Stride', 'Zapatillas claras con suela coral para el día a día.'),
  ((select id from public.products where slug = 'pulse-headphones'), 'fr', 'Casque sans fil Pulse', 'Un casque circum-aural noir avec des coussinets souples.'),
  ((select id from public.products where slug = 'pulse-headphones'), 'es', 'Auriculares inalámbricos Pulse', 'Auriculares circumaurales negros con almohadillas suaves.'),
  ((select id from public.products where slug = 'desk-lamp'), 'fr', 'Lampe de bureau Dôme', 'Une petite lampe de table avec abat-jour crème et pied vert.'),
  ((select id from public.products where slug = 'desk-lamp'), 'es', 'Lámpara de escritorio Domo', 'Una lámpara pequeña con pantalla crema y base verde.'),
  ((select id from public.products where slug = 'studio-care'), 'fr', 'Coffret de soins Studio', 'Un ensemble de flacons et un pot de soin pour la salle de bain.'),
  ((select id from public.products where slug = 'studio-care'), 'es', 'Set de cuidado Studio', 'Un conjunto de frascos y un tarro de cuidado para el baño.'),
  ((select id from public.products where slug = 'everyday-bag'), 'fr', 'Sac du quotidien', 'Un sac bandoulière compact en nylon beige.'),
  ((select id from public.products where slug = 'everyday-bag'), 'es', 'Bolso para el día a día', 'Un bolso bandolera compacto de nailon beige.'),
  ((select id from public.products where slug = 'training-kit'), 'fr', 'Kit entraînement Duo', 'Deux haltères bleus et une gourde grise.'),
  ((select id from public.products where slug = 'training-kit'), 'es', 'Kit de entrenamiento Duo', 'Dos mancuernas azules y una botella gris.'),
  ((select id from public.products where slug = 'stacking-rings'), 'fr', 'Anneaux et cubes en bois', 'Un jeu d’empilage coloré avec deux cubes en bois.'),
  ((select id from public.products where slug = 'stacking-rings'), 'es', 'Anillos y bloques de madera', 'Un juego de apilamiento de colores con dos bloques de madera.'),
  ((select id from public.products where slug = 'pocket-speaker'), 'fr', 'Duo audio de poche', 'Une enceinte compacte accompagnée d’écouteurs sans fil.'),
  ((select id from public.products where slug = 'pocket-speaker'), 'es', 'Dúo de audio de bolsillo', 'Un altavoz compacto con auriculares inalámbricos.')
on conflict (product_id, locale) do nothing;

insert into public.product_images(product_id, storage_path, alt, width, height, is_cutout, sort_order) values
  ((select id from public.products where slug = 'stride-sneaker'), '/images/home/sneaker.webp', '{"fr":"Basket gris clair avec une semelle corail","es":"Zapatilla gris clara con suela coral"}'::jsonb, 608, 608, true, 0),
  ((select id from public.products where slug = 'pulse-headphones'), '/images/home/headphones.webp', '{"fr":"Casque sans fil noir à coussinets","es":"Auriculares inalámbricos negros con almohadillas"}'::jsonb, 608, 608, true, 0),
  ((select id from public.products where slug = 'desk-lamp'), '/images/home/dome-lamp.webp', '{"fr":"Lampe dôme crème avec un pied vert","es":"Lámpara de cúpula crema con base verde"}'::jsonb, 608, 608, true, 0),
  ((select id from public.products where slug = 'studio-care'), '/images/home/category-beauty.webp', '{"fr":"Flacons de soin et pot de crème","es":"Frascos de cuidado y tarro de crema"}'::jsonb, 512, 512, false, 0),
  ((select id from public.products where slug = 'everyday-bag'), '/images/home/crossbody.webp', '{"fr":"Sac bandoulière beige en nylon","es":"Bolso bandolera de nailon beige"}'::jsonb, 608, 608, true, 0),
  ((select id from public.products where slug = 'training-kit'), '/images/home/category-sport.webp', '{"fr":"Haltères bleus et gourde grise","es":"Mancuernas azules y botella gris"}'::jsonb, 512, 512, false, 0),
  ((select id from public.products where slug = 'stacking-rings'), '/images/home/category-children.webp', '{"fr":"Anneaux colorés et cubes en bois","es":"Anillos de colores y bloques de madera"}'::jsonb, 512, 512, false, 0),
  ((select id from public.products where slug = 'pocket-speaker'), '/images/home/category-electronics.webp', '{"fr":"Écouteurs sans fil et enceinte noire","es":"Auriculares inalámbricos y altavoz negro"}'::jsonb, 512, 512, false, 0)
on conflict (product_id, storage_path) do nothing;

insert into public.store_settings(store_name, announcement, support_information) values ('Testy Shop', '{"fr":"Découvrez les nouveautés et les offres Testy Shop.","es":"Descubre las novedades y ofertas de Testy Shop."}'::jsonb, '{"fr":"Une question avant de commander ? Consulte les infos d’assistance.","es":"¿Tienes dudas antes de comprar? Consulta la información de ayuda."}'::jsonb) on conflict (singleton) do nothing;

commit;
