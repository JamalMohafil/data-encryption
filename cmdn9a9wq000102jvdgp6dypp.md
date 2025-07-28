---
title: "How I Made Product Creation 60x Faster Using Events (From 6s to 100ms) 🔥💪"
seoTitle: "How I Made Product Creation 60x Faster"
seoDescription: "Learn how I reduced product creation time from 6s to 100ms using event-driven architecture in a real e-commerce backend."
datePublished: Mon Jul 28 2025 15:21:38 GMT+0000 (Coordinated Universal Time)
cuid: cmdn9a9wq000102jvdgp6dypp
slug: how-i-made-product-creation-60x-faster-using-events-from-6s-to-100ms
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1753715932625/8761f9a0-c058-40bf-bb61-21972be170dc.png
tags: programming-blogs, backend, apis, system-design, nestjs, event-driven-architecture

---

Hello everyone  
I’m Jamal, a 16-year-old developer working on a big e-commerce project. Today I wanna share something crazy that happened to me while building the backend.

---

## The Problem

Everything was going well until I had to build the **product creation**.

Each product in my system has more than 15 related parts:

* Images (with translations)
    
* Videos (with translations)
    
* Reviews
    
* Cart items
    
* Wishlist items
    
* Attributes (with translations)
    
* Dimensions (with translations)
    
* Materials (with translations)
    
* Options (with images and translations for each option and translations for each image)
    
* Details (with translations)
    
* and more...
    

Some of these even have their own translations. For example, an attribute might have a translation in Arabic and English. So when the admin tries to create one product with all this data the request takes more than **6 seconds**!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

That’s bad no one wants to wait that long.

---

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1753715942744/7d0cf423-ff72-46a7-aa5d-beaf826f8d4e.png align="center")

## The Idea 💡

I started reading and researching and remembered something I already used before: **event-driven architecture**.

I used it for small things like sending emails. But then I asked myself:

> *"Why not use events to handle product creation too?"*

Instead of doing everything in one go, why not:

* Save the **basic product** first.
    
* Then fire an **event**.
    
* Let that event process all the heavy stuff in the background.
    

Boom 💥 — that worked! The API now responds in under **100ms**, and all the other stuff happens behind the scenes.

---

## How I Did It 🔧

### Step 1: Create the Event

```typescript
export class ProductCoreCreatedEvent implements IEvent {
  constructor(
    public readonly productId: string,
    public readonly product: ProductAggregate,
    public readonly userId: string,
  ) {}
}
```

### Step 2: Handle the Event

```typescript
@EventsHandler(ProductCoreCreatedEvent)
export class ProductCoreCreatedEventHandler
  implements IEventHandler<ProductCoreCreatedEvent> {
  async handle(event: ProductCoreCreatedEvent) {
    const { product, productId, userId } = event;

    await Promise.allSettled([
      this.processTranslations(productId, product.getAllTranslations()),
      this.processImages(productId, product.getImages()),
      this.processVideos(productId, product.getVideos()),
      this.processAttributes(productId, product.getAllAttributes()),
      this.processOptions(productId, product.getAllOptions()),
      this.processDimensions(productId, product.getDimension()),
      this.processDetails(productId, product.getDetails()),
      this.processAssemblyGuide(productId, product.getAssemblyGuide()),
      this.processMaterials(productId, product.getMaterials()),
    ]);

    await this.eventBus.publishCqrsEvent(
      new ProductFullyProcessedEvent(productId, userId, 'CREATE'),
    );
  }
}
```

### Step 3: Update the Command Handler

Instead of handling everything in the command, I just send the event:

```typescript
@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand> {
  async execute(command: CreateProductCommand): Promise<any> {
    // Do basic validation
    const isSkuUnique = await this.repo.isSkuUnique(command.props.sku);
    if (!isSkuUnique) throw new BadRequestException('SKU must be unique');

    const productCore = this.buildProductCore(command);
    await this.repo.createCore(productCore);

    // Fire the event in the background
    setImmediate(() => {
      this.eventBus.publishCqrsEvent(
        new ProductCoreCreatedEvent(productCore.id, productCore, command.userId),
      );
    });

    return true;
  }
}
```

---

## The Result 🚀

✅ Request time went from **6 seconds** to **under 100ms🔥**  
✅ No more waiting for the user  
✅ Product still gets fully created in the background  
✅ Clean and scalable architecture

I even did the same thing for **product updates**, because they were slow too. Now updates also run in the background.

---

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1753715936700/84a61909-cb83-4146-bd69-a02944990f6b.png align="center")

## Warning ⚠️

This method is great for background work — but **don’t use it when the user needs an immediate result**.

For example:

* If you're doing a `getProductById`, you can’t use an event.
    
* If you're checking if a slug or name is unique, that **has to be done before** sending the event.
    

If you move important checks inside the event, and an error happens, the user won’t see it — it’ll just crash in the terminal.

So always do your **validations before** sending the event.

---

## Final Words

This trick saved me and I hope it helps you too. If you’re working on a big system and feel your API is too slow try using **event-driven architecture**. Trust me, it works.

Thanks for reading!  
I’m just getting started on my coding journey, and I’ll be sharing more cool stuff soon.  
Feel free to follow me! 😊

**— Jamal Mohafil**