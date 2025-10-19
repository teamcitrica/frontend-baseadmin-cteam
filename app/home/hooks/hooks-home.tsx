export default function useHooksHome() {
  const ctaOnClick = () => {
    console.log('CTA Clicked');
  };
  return {
    ctaOnClick
  };
}