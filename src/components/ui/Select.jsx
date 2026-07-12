export default function Select({ label, options, ...props }) {
    return (

        { label && { label }}
      
        Select { label.toLowerCase() }
{
    options.map((opt) => (
        { opt }
    ))
}
      
    
  );
}