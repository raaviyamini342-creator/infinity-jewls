function Products() {
  return (
    <section className="products">
      <h2>Featured Collection</h2>

      <div className="product-grid">

        <div className="card">
          <h3>Diamond Ring</h3>
          <p>$999</p>
          <button>Buy Now</button>
        </div>

        <div className="card">
          <h3>Gold Necklace</h3>
          <p>$1299</p>
          <button>Buy Now</button>
        </div>

        <div className="card">
          <h3>Luxury Bracelet</h3>
          <p>$899</p>
          <button>Buy Now</button>
        </div>

      </div>
    </section>
  );
}

export default Products;