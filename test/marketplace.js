const Marketplace = artifacts.require("Marketplace");

contract("Marketplace", accounts => {
	const [owner, admin, storeOwner] = accounts;
	
	let market;
	
	beforeEach(async() => {
		market = await Marketplace.new();
	});
		
	it("should set contract owner", async () => {
		assert.equal(await market.owner.call(), owner);
	});

	it("should set admin from owner account", async () => {
		await market.addAdmin(admin, { from: owner });
	});

	it("should add store owner from admin account", async () => {
		await market.addAdmin(admin, { from: owner })
		.then(() => market.addStoreOwner(storeOwner, { from: admin }));
	});

	it("should verify store owner", async () => {
		let verify = await market.addAdmin(admin, { from: owner })
		.then(() => market.addStoreOwner(storeOwner, { from: admin }))
		.then(() => market.isStoreOwner({ from: storeOwner }));

		assert(verify === true);
	});

	it("should add store front for store owner", async () => {
		let storeFrontList = await market.addAdmin(admin, { from: owner })
		.then(() => market.addStoreOwner(storeOwner, { from: admin }))
		.then(() => market.addStoreFront("My First Store", { from: storeOwner }))
		.then(() => market.getStoreFrontsList({ from: storeOwner }));
		let storeFrontName = await market.getStoreFrontName(storeFrontList[0], { from: storeOwner });

		assert(storeFrontName === "My First Store");
	});
});