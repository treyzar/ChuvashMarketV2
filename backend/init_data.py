"""
Скрипт инициализации тестовых данных для ChuvashMarket
"""
import os
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chuvashmarket.settings')
django.setup()

from django.contrib.auth import get_user_model
from market.models import Category, Product, Profile, Order, OrderItem

User = get_user_model()

def create_superuser():
    """Создаём суперпользователя для админ-панели"""
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@chuvashmarket.local',
            password='admin123',
            role=User.Roles.ADMIN
        )
        print("✓ Суперпользователь admin создан")
    else:
        print("✓ Суперпользователь admin уже существует")

def create_test_sellers():
    """Создаём тестовых продавцов"""
    sellers_data = [
        {
            'username': 'seller_honey',
            'email': 'honey@local.ru',
            'first_name': 'Иван',
            'last_name': 'Пасечников',
            'password': 'seller123'
        },
        {
            'username': 'seller_crafts',
            'email': 'crafts@local.ru',
            'first_name': 'Мария',
            'last_name': 'Ремесленница',
            'password': 'seller123'
        },
        {
            'username': 'seller_farm',
            'email': 'farm@local.ru',
            'first_name': 'Петр',
            'last_name': 'Фермер',
            'password': 'seller123'
        }
    ]
    
    sellers = []
    for seller_data in sellers_data:
        password = seller_data.pop('password')
        if not User.objects.filter(username=seller_data['username']).exists():
            seller = User.objects.create_user(
                **seller_data,
                role=User.Roles.SELLER
            )
            seller.set_password(password)
            seller.save()
            sellers.append(seller)
            print(f"✓ Продавец {seller_data['username']} создан")
        else:
            sellers.append(User.objects.get(username=seller_data['username']))
            print(f"✓ Продавец {seller_data['username']} уже существует")
    
    return sellers

def create_categories():
    """Создаём категории товаров"""
    categories_data = [
        {'name': 'Еда и напитки', 'slug': 'food'},
        {'name': 'Сувениры', 'slug': 'souvenirs'},
        {'name': 'Одежда и аксессуары', 'slug': 'clothes'},
        {'name': 'Дом и интерьер', 'slug': 'home'},
        {'name': 'Косметика и здоровье', 'slug': 'health'},
    ]
    
    categories = []
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name']}
        )
        categories.append(cat)
        status = "создана" if created else "уже существует"
        print(f"✓ Категория '{cat.name}' {status}")
    
    return categories

def create_test_products(sellers, categories):
    """Создаём тестовые товары"""
    products_data = [
        # Категория "Еда и напитки"
        {
            'name': 'Чувашский мёд гречневый',
            'description': 'Натуральный гречневый мёд с яблочной кислинкой. Сыроедческий, не прошедший тепловую обработку.',
            'price': 450,
            'category': categories[0],  # Еда
            'seller': sellers[0],  # seller_honey
        },
        {
            'name': 'Чувашский мёд подсолнечный',
            'description': 'Светлый мёд из подсолнечника. Высокое содержание полезных микроэлементов.',
            'price': 380,
            'category': categories[0],
            'seller': sellers[0],
        },
        {
            'name': 'Натуральный квас на хлебе',
            'description': 'Традиционный чувашский квас, приготовленный по старинному рецепту.',
            'price': 120,
            'category': categories[0],
            'seller': sellers[2],  # seller_farm
        },
        {
            'name': 'Деревенское сливочное масло',
            'description': 'Масло 82% жирности, изготовленное вручную из сливок.',
            'price': 280,
            'category': categories[0],
            'seller': sellers[2],
        },
        
        # Категория "Сувениры"
        {
            'name': 'Деревянная шкатулка "Узоры Чувашии"',
            'description': 'Изящная деревянная шкатулка с традиционными чувашскими узорами. Ручная резьба.',
            'price': 750,
            'category': categories[1],  # Сувениры
            'seller': sellers[1],  # seller_crafts
        },
        {
            'name': 'Тканая салфетка "Герес"',
            'description': 'Салфетка из льна и хлопка с традиционным орнаментом. Размер 40x40 см.',
            'price': 220,
            'category': categories[1],
            'seller': sellers[1],
        },
        {
            'name': 'Кукла-оберег "Чувашская красавица"',
            'description': 'Традиционная куколка-оберег ручной работы. Высота 12 см.',
            'price': 180,
            'category': categories[1],
            'seller': sellers[1],
        },
        
        # Категория "Одежда"
        {
            'name': 'Платок вышитый "Тетел"',
            'description': 'Традиционный платок из льна с ручной вышивкой. Размер 80x80 см.',
            'price': 320,
            'category': categories[2],  # Одежда
            'seller': sellers[1],
        },
        
        # Категория "Дом и интерьер"
        {
            'name': 'Керамическая тарелка "Чувашский узор"',
            'description': 'Декоративная тарелка из керамики. Диаметр 25 см. Авторская роспись.',
            'price': 290,
            'category': categories[3],  # Дом
            'seller': sellers[1],
        },
        
        # Категория "Косметика и здоровье"
        {
            'name': 'Медовая маска для лица',
            'description': 'Натуральная маска на основе чувашского мёда и растительных масел.',
            'price': 350,
            'category': categories[4],  # Здоровье
            'seller': sellers[0],
        },
    ]
    
    count = 0
    products = []
    for product_data in products_data:
        defaults = {k: v for k, v in product_data.items() if k != 'name'}
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            seller=product_data['seller'],
            defaults=defaults
        )
        products.append(product)
        if created:
            count += 1
            print(f"✓ Товар '{product.name}' создан")
        else:
            print(f"✓ Товар '{product.name}' уже существует")
    
    print(f"\nВсего создано новых товаров: {count}")
    return products

def create_sample_orders(sellers, products):
    """Создаём примерные заказы и продажи для аналитики продавцов."""
    import random
    from django.utils import timezone
    from datetime import timedelta

    # создаём несколько покупателей
    customers_data = [
        {"username": "buyer_anna", "email": "anna@local.ru", "password": "buyer123"},
        {"username": "buyer_oleg", "email": "oleg@local.ru", "password": "buyer123"},
        {"username": "buyer_masha", "email": "masha@local.ru", "password": "buyer123"},
        {"username": "buyer_dima", "email": "dima@local.ru", "password": "buyer123"},
        {"username": "buyer_lena", "email": "lena@local.ru", "password": "buyer123"},
        {"username": "buyer_ivan", "email": "ivan@local.ru", "password": "buyer123"},
    ]
    customers = []
    for c in customers_data:
        if not User.objects.filter(username=c["username"]).exists():
            u = User.objects.create_user(username=c["username"], email=c["email"], role=User.Roles.CUSTOMER)
            u.set_password(c["password"])
            u.save()
            customers.append(u)
        else:
            customers.append(User.objects.get(username=c["username"]))

    # Генерируем много заказов за последние 30 дней для хорошей аналитики
    now = timezone.now()
    orders_created = 0
    
    for days_ago in range(0, 28):
        # От 2 до 4 заказов в день
        orders_per_day = random.randint(2, 4)
        
        for _ in range(orders_per_day):
            order_date = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            buyer = random.choice(customers)
            order = Order.objects.create(
                buyer=buyer,
                contact_name=f"{buyer.first_name or buyer.username}",
                contact_phone="+7" + "".join([str(random.randint(0, 9)) for _ in range(10)]),
                delivery_method=random.choice(["pickup", "delivery"]),
                delivery_address="г. Чебоксары, ул. Примерная, " + str(random.randint(1, 100)),
                created_at=order_date,
                updated_at=order_date,
            )

            # добавим 1-4 товаров в заказ (случайные продавцы)
            items_count = random.randint(1, 4)
            chosen = random.sample(products, min(items_count, len(products)))
            total = 0
            for prod in chosen:
                qty = random.randint(1, 5)
                OrderItem.objects.create(order=order, product=prod, seller=prod.seller, quantity=qty, price=prod.price)
                total += float(prod.price) * qty
            order.total_price = total
            order.save()
            orders_created += 1

    print(f"✓ Создано {orders_created} заказов за последние 30 дней")



def main():
    print("=" * 60)
    print("Инициализация тестовых данных для ChuvashMarket")
    print("=" * 60)
    
    print("\n1. Создание суперпользователя...")
    create_superuser()
    
    print("\n2. Создание тестовых продавцов...")
    sellers = create_test_sellers()
    
    print("\n3. Создание категорий товаров...")
    categories = create_categories()
    
    print("\n4. Создание тестовых товаров...")
    products = create_test_products(sellers, categories)

    print("\n5. Создание примерных заказов для аналитики...")
    create_sample_orders(sellers, products)

    print("\n" + "=" * 60)
    print("✓ Инициализация завершена!")
    print("=" * 60)
    print("\nДанные для входа:")
    print("- Админ: admin / admin123")
    print("- Продавец 1: seller_honey / seller123")
    print("- Продавец 2: seller_crafts / seller123")
    print("- Продавец 3: seller_farm / seller123")
    print("\nАвтоматически созданы товары в категориях:")
    print("- Еда и напитки")
    print("- Сувениры")
    print("- Одежда")
    print("- Дом и интерьер")
    print("- Косметика и здоровье")

if __name__ == '__main__':
    main()
