function TypingIndicator({
  typing
}) {

  if (!typing) return null;

  return (
    <div>
      Typing...
    </div>
  );
}

export default TypingIndicator;