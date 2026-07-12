export default function Input({ label, error, ...props }) {
    return (

        { label && { label }}

{ error && { error } }
    
  );
}